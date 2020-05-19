import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { ServiceConfiguration } from 'meteor/service-configuration';
import { has } from 'lodash';
import { formatPhoneNumber } from '/imports/lib/utils';

import { MemberThemes, Themes } from '/imports/api/db';

import '/imports/api/methods';
import twilio from 'twilio';

// Meteor publication definitions
import '/imports/server/publications';

Meteor.startup(() => {
	// Save API info to DB once (upsert)
	ServiceConfiguration.configurations.upsert(
		{ service: 'google' },
		{
			$set: {
				clientId: Meteor.settings.google.client_id,
				projectId: Meteor.settings.google.client_id,
				authUri: Meteor.settings.google.auth_uri,
				tokenUri: Meteor.settings.google.token_uri,
				authProviderX509CertUrl: Meteor.settings.google.auth_provider_x509_cert_url,
				secret: Meteor.settings.google.client_secret,
				redirectUris: Meteor.settings.google.redirect_uris,
				javascriptOrigins: Meteor.settings.google.javascript_origins,
				loginStyle: 'popup',
			}
		}
	);

	process.env.MAIL_URL = Meteor.settings.MAIL_URL;
	process.env.HOST_NAME = Meteor.settings.HOST_NAME;
	
	// const themeId = 'iTL2SfNx9SHM3BhFq';
	// const themeId = 'fEYxEXpMcHuhjoNzD';
	// const memberPhoneNumbers = memberPhoneNumbersQuery(themeId);
	// console.log({ memberPhoneNumbers });
});

const memberPhoneNumbersQuery = themeId => {
	return MemberThemes.aggregate([
		{
			$match: { 
				theme: themeId
			}
		},
		{
			$lookup: {
				from: 'members',
				localField: 'member',
				foreignField: '_id',
				as: 'member'
			}	
		},
		{ $unwind: '$member' },
		{
			$match: {
				'member.phone': { $ne: null }
			}
		},
		{
			$project: {
				_id: 1,
				phone: '$member.phone',
				code: '$member.code'
			}
		}
	]);
};

const memberEmailsQuery = themeId => {
	return MemberThemes.aggregate([
		{
			$match: { 
				theme: themeId
			}
		},
		{
			$lookup: {
				from: 'members',
				localField: 'member',
				foreignField: '_id',
				as: 'member'
			}	
		},
		{ $unwind: '$member' },
		{
			$match: {
				'member.email': { $ne: null }
			}
		},
		{
			$project: {
				_id: 1,
				email: '$member.email',
				code: '$member.code'
			}
		}
	]);
};

Meteor.methods({
	/***************************
	 *  TWILIO SERVER METHOD   *
	 ***************************/
	textVotingLinkToMembers: ({ themeId, message, link }) => { // link: boolean		
		const theme = Themes.findOne({ _id: themeId }); // Just need the slug from the theme

		const messageBuilder = member => {
			let finalMessage = message;
			// eslint-disable-next-line quotes
			if(link !== false && theme.slug) finalMessage += "\n" + `${process.env.HOST_NAME}/v/${theme.slug}/${member.code}`;
			return finalMessage;
		};

		const client = twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken);

		let texts = [];
		const memberPhoneNumbers = memberPhoneNumbersQuery(themeId);
		
		memberPhoneNumbers.forEach(member => {
			const message = messageBuilder(member);
			const text = client.messages.create({
				body: message,
				to: formatPhoneNumber(member.phone),
				messagingServiceSid: Meteor.settings.twilio.copilotSid
			}).then(message => console.log(message));
			texts.push(text);
		});
		return texts;
	},

	/***************************
	 *  EMAIL MEMBERS METHOD   *
	 ***************************/
	emailVotingLinkToMembers: ({ themeId, message }) => { //(to, from, subject, text) {
		const theme = Themes.findOne({ _id: themeId }); // Just need the slug from the theme
		
		const messageBuilder = member => {
			let finalMessage = message.body;
			if(message.includeLink === true && theme.slug) finalMessage += `<p><a href='${process.env.HOST_NAME}/v/${theme.slug}/${member.code}'>Allocation Night Voting Portal</a></p>`;
			return finalMessage;
		};

		const memberEmails = memberEmailsQuery(themeId);

		let emails = [];
		memberEmails.forEach(member => {
			const email = Email.send({ 
				to: member.email, 
				from: message.from || 'support@thebatterysf.com', 
				subject: message.subject, 
				html: messageBuilder(member) 
			});
			emails.push(email);
		});
		return emails;
	}
});

/***************************
 *   ACCOUNTS VALIDATION   *
 ***************************/
Accounts.validateNewUser(user => {
	let valid = false;

	// Restrict Google auth to emails from specific domains
	if(has(user, 'services.google.email')) {
		const emailParts = user.services.google.email.split('@');
		const domain = emailParts[emailParts.length - 1];
		
		valid = Meteor.settings.google.allowed_domains.some(check => check === domain);
	}

	if(valid) {
		return true;
	}

	throw new Meteor.Error(403, 'Must log in using a "thebatterysf.com" email address');
});
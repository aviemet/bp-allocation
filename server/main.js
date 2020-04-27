import { Meteor } from 'meteor/meteor';
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

/***************************
 *  TWILIO SERVER METHODS  *
 ***************************/
Meteor.methods({
	textVotingLinkToMembers: ({ themeId, message, link }) => { // link: boolean
		const theme = Themes.findOne({ _id: themeId }); // Just need the slug from the theme

		const messageBuilder = member => {
			let finalMessage = message;
			// eslint-disable-next-line quotes
			if(link !== false && theme.slug) finalMessage += "\n" + `www.batterysf.com/v/${theme.slug}/${member.code}`;
			return finalMessage;
		};

		const client = twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken);

		let texts = [];
		const memberPhoneNumbers = memberPhoneNumbersQuery(themeId);
		console.log({ memberPhoneNumbers });
		memberPhoneNumbers.forEach(member => {
			const message = messageBuilder(member);
			console.log({ message });
			const text = client.messages.create({
				body: message,
				to: formatPhoneNumber(member.phone),
				messagingServiceSid: Meteor.settings.twilio.copilotSid
			}).then(message => console.log(message));
			texts.push(text);
		});
		return texts;
	}
});

/*
Meteor.methods({
	sendMessage: (number, message) => {
		const client = twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken);
		// console.log({ number, message });
		const text = client.messages.create({
			body: message,
			to: formatPhoneNumber(number),
			messagingServiceSid: Meteor.settings.twilio.copilotSid
		}).then(message => console.log(message));
		// console.log({ text });
		return text;
	}
});
*/
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
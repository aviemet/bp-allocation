import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import _ from 'lodash';

import {
	Themes,
	PresentationSettings,
	Organizations,
	Images,
	Members,
	MemberThemes
} from '/imports/api';

import '/imports/api/methods';
import twilio from 'twilio';

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

	Meteor.publish('themes', (themeId) => {
		if(themeId){
			return Themes.find({ _id: themeId });
		}
		return Themes.find({});
	});

	Meteor.publish('presentationSettings', (settingsId) => {
		try{
			return PresentationSettings.find({ _id: settingsId });
		} catch(e) {
			console.error('Specify an ID to fetch presentation settings');
		}
	});

	Meteor.publish('organizations', (themeId) => {
		if(! themeId) return Organizations.find({});

		return Organizations.find({ theme: themeId });
	});

	Meteor.publish('organization', (orgId) => {
		if(orgId){
			return Organizations.find({ _id: orgId });
		}
		// TODO: return error
	});

	// Images need the cursor
	Meteor.publish('image', (id) =>  {
		if(!id) return false;

		return Images.find({ _id: id }).cursor;
	});

	Meteor.publish('images', (ids) => {
		if(!ids) return false;

		return Images.find({ _id: { $in: ids }}).cursor;
	});

	Meteor.publish('images.byTheme', function(themeId) {
		if(!themeId) return Images.find({}).cursor;

		let orgs = Organizations.find({ theme: themeId }, { _id: true, image: true }).fetch();

		let imgIds = [];
		orgs.map((org, i) => {
			imgIds.push(org.image);
		});

		return Images.find({ _id: { $in: imgIds }}).cursor;
	});

	// Find Members and associated theme values
	Meteor.publish('memberThemes', (themeId) => {
		if(!themeId) return MemberThemes.find({});
		return MemberThemes.find({ theme: themeId });
	});

	Meteor.publish('members', (ids) => {
		if(!ids) return Members.find({});
		return Members.find({ _id: { $in: ids }});
	/*
		const rawMembers = Members.rawCollection();
		const aggregate = Meteor.wrapAsync(rawMembers.aggregate, rawMembers);

		const results = aggregate([
			{
				$match: {
					_id: {
						$in: ids
					}
				}
			},
			{
				$addFields: {
					code: {
						$concat: [
							"$initials",
							{
								$convert: {
									input: "$number",
									to: "string",
									onError: "Error",
									onNull: ""
								}
							}
						]
					}
				}
			}
		], {
			cursor: { batchSize: 1000 }
		});

		console.log({results: results});
		return [results];


		const members = Members.aggregate([
			{
				$match: {
					_id: {
						$in: ids
					}
				}
			},
			{
				$addFields: {
					code: {
						$concat: [
							"$initials",
							{
								$convert: {
									input: "$number",
									to: "string",
									onError: "Error",
									onNull: ""
								}
							}
						]
					}
				}
			}
		]);

		console.log({members});

		return members;

	*/
	});
});

Meteor.methods({
	sendMessage: (number, message) => {
		const client = twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken);
		console.log({ number, message });
		const text = client.messages.create({
			body: message,
			to: `+1${number}`,
			from: Meteor.settings.twilio.fromNumber
		}).then(message => console.log(message));
		console.log({ text });
	}
});

Accounts.validateNewUser(user => {
	let valid = false;

	if(_.has(user, 'services.google.email')) {
		const emailParts = user.services.google.email.split('@');
		const domain = emailParts[emailParts.length -1];
		
		valid = Meteor.settings.google.allowed_domains.some(check => check === domain);
	}

	if(valid) {
		return true;
	}

	throw new Meteor.Error(403, 'Must log in using a thebatterysf.com email address');
});
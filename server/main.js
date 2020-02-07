import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';
import _ from 'lodash';
import { formatPhoneNumber } from '/imports/lib/utils';

import { Organizations } from '/imports/api';

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

});

/***************************
 *  TWILIO SERVER METHODS  *
 ***************************/
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

/***************************
 *   ACCOUNTS VALIDATION   *
 ***************************/
Accounts.validateNewUser(user => {
	let valid = false;

	// Restrict Google auth to emails from specific domains
	if(_.has(user, 'services.google.email')) {
		const emailParts = user.services.google.email.split('@');
		const domain = emailParts[emailParts.length - 1];
		
		valid = Meteor.settings.google.allowed_domains.some(check => check === domain);
	}

	if(valid) {
		return true;
	}

	throw new Meteor.Error(403, 'Must log in using a "thebatterysf.com" email address');
});
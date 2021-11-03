import { Meteor } from 'meteor/meteor'
import { ServiceConfiguration } from 'meteor/service-configuration'
import { has } from 'lodash'

import textVotingLinkToMembers from '/imports/server/sms'
import emailVotingLinkToMembers from '/imports/server/email'

import '/imports/api/methods'

// Meteor publication definitions
import '/imports/server/publications'

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
	)

	process.env.MAIL_URL = Meteor.settings.MAIL_URL
	process.env.HOST_NAME = Meteor.settings.HOST_NAME
	process.env.SENDGRID_API_KEY = Meteor.settings.SENDGRID_API_KEY
})

Meteor.methods({
	textVotingLinkToMembers,
	emailVotingLinkToMembers
})

/***************************
 *   ACCOUNTS VALIDATION   *
 ***************************/
// eslint-disable-next-line no-undef
Accounts.validateNewUser(user => {
	let valid = false

	// Restrict Google auth to emails from specific domains
	if(has(user, 'services.google.email')) {
		const emailParts = user.services.google.email.split('@')
		const domain = emailParts[emailParts.length - 1]

		valid = Meteor.settings.google.allowed_domains.some(check => check === domain)
	}

	if(valid) {
		return true
	}

	throw new Meteor.Error(403, 'Must log in using a "thebatterysf.com" email address')
})

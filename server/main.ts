import "meteor/aldeed:collection2"
import { has } from "es-toolkit/compat"
import { Accounts } from "meteor/accounts-base"
import { Meteor } from "meteor/meteor"
import { ServiceConfiguration } from "meteor/service-configuration"
import "meteor/accounts-google"

import "/imports/api/methods"
import "/imports/api/db"
import "./api/methods/staticSnapshotMethods"
import "./api/methods/messagingMethods"

import "/imports/server/publications"

Meteor.startup(async () => {
	await ServiceConfiguration.configurations.upsertAsync(
		{ service: "google" },
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
				loginStyle: "popup",
			},
		}
	)

	process.env.MAIL_URL = Meteor.settings.MAIL_URL
	process.env.HOST_URL = Meteor.settings.HOST_URL
	process.env.SENDGRID_API_KEY = Meteor.settings.SENDGRID_API_KEY
})

/***************************
 *   ACCOUNTS VALIDATION   *
 ***************************/
Accounts.validateNewUser((user: Meteor.User) => {
	let valid = false

	// Restrict Google auth to emails from specific domains
	if(has(user, "services.google.email") && user.services?.google?.email) {
		const emailParts = user.services.google.email.split("@")
		const domain = emailParts[emailParts.length - 1]

		valid = Meteor.settings.google.allowed_domains.some((check: string) => check === domain)
	}

	if(valid) {
		return true
	}

	throw new Meteor.Error(403, 'Must log in using a "thebatterysf.com" email address')
})

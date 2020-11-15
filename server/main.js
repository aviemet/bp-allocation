import { Meteor } from 'meteor/meteor'
// import { Email } from 'meteor/email'
import { ServiceConfiguration } from 'meteor/service-configuration'
import { sendMassEmail } from './email'


import { has } from 'lodash'
import { formatPhoneNumber } from '/imports/lib/utils'
import { MemberThemes, Themes } from '/imports/api/db'

import '/imports/api/methods'
import twilio from 'twilio'

// Meteor publication definitions
import '/imports/server/publications'
import moment from 'moment'
import { PresentationSettings } from '../imports/api/db'

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
	])
}

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
	])
}

const htmlEmailWrapper = yeild => `<html><head><style> 
	img { 
		max-width: 100% !important;
		margin: 4px;
		padding: 4px;
		background-color: #FFF;
		border: solid 1px #CCC;
		border-radius: 2px;
	} 
</style></head><body><div style="max-width: 600px; margin: 0 auto;">${yeild}</div></body></html>`

Meteor.methods({
	/***************************
	 *  TWILIO SERVER METHOD   *
	 ***************************/
	textVotingLinkToMembers: ({ themeId, message }) => {
		const theme = Themes.findOne({ _id: themeId }) // Just need the slug from the theme
		const messageBuilder = member => {
			let finalMessage = message.body
			if(message.includeLink === true && theme.slug) {
				// eslint-disable-next-line quotes
				finalMessage += "\n" + `${process.env.HOST_NAME}/v/${theme.slug}/${member.code}`
			}
			return finalMessage
		}

		const client = twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken)

		// client.messages.create returns a promise, but I've wrapped it in another promise so that I could send a
		// tuple back with the failure case. The catch method returns { error, member } to be used in retries
		const smsToMember = member => {
			return new Promise((resolve, reject) => {
				client.messages.create({
					body: messageBuilder(member),
					to: formatPhoneNumber(member.phone),
					messagingServiceSid: Meteor.settings.twilio.copilotSid
				}).then(response => {
					console.log({
						at: moment().format('YYYY-MM-DD HH:mm:ss:SS'),
						messageType: 'text',
						to: response.to,
						status: response.status
					})
					resolve(response)
				}).catch(error => {
					console.error(error, member.phone)
					reject({ error, member })
				})
			})
		}

		const settings = PresentationSettings.findOne({ _id: theme.presentationSettings })

		const memberPhoneNumbers = memberPhoneNumbersQuery(themeId)

		const rateLimitMs = settings.twilioRateLimit || 100
		const retryLimit = 2

		// Uses setInterval to rate limit sending texts to Twilio
		const sendTextsWithRetry = members => {
			const failedTexts = []

			let i = 0
			const interval = setInterval(() => {
				smsToMember(members[i++]).catch(({ error, member }) => {
					const retry = member.hasOwnProperty('retry') ? member.retry + 1 : 0
					if(retry <= retryLimit) {
						failedTexts.push(Object.assign(member, { retry }))
					}
				})

				if(i >= members.length) {
					clearInterval(interval)

					if(failedTexts.length > 0) {
						sendTextsWithRetry(failedTexts)
					}
				}
			}, rateLimitMs)
		}

		sendTextsWithRetry(memberPhoneNumbers)
	},

	/***************************
	 *  EMAIL MEMBERS METHOD   *
	 ***************************/
	emailVotingLinkToMembers: ({ themeId, message }) => {
		const theme = Themes.findOne({ _id: themeId }) // Just need the slug from the theme

		const messageBuilder = member => {
			let finalMessage = message.body
			if(message.includeLink === true && theme.slug) {
				finalMessage += `<p style='text-align: center; height: 4rem;'><a style='font-family: Arial, sans-serif; font-size: 2rem; padding: 15px; margin-bottom: 10px; border: 1px solid #CCC; border-radius: 10px; background-color: green; color: white; text-decoration: none;' href='${process.env.HOST_NAME}/v/${theme.slug}/${member.code}'>Vote Here</a></p>`
			}
			return htmlEmailWrapper(finalMessage)
		}

		const memberEmails = memberEmailsQuery(themeId)

		const messages = memberEmails.map(member => {
			return {
				to: member.email,
				from: message.from || 'powered@thebatterysf.com',
				subject: message.subject,
				html: messageBuilder(member)
			}
		})

		sendMassEmail(messages)
	}
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
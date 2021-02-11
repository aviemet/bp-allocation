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
	
	// const themeId = 'iTL2SfNx9SHM3BhFq'
	// const themeId = 'fEYxEXpMcHuhjoNzD'
	// const memberPhoneNumbers = memberPhoneNumbersQuery(themeId)
	// console.log({ memberPhoneNumbers })
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
		let texts = []
		const memberPhoneNumbers = memberPhoneNumbersQuery(themeId)
		
		memberPhoneNumbers.forEach(member => {
			const finalMessage = messageBuilder(member)

			const text = client.messages.create({
				body: finalMessage,
				to: formatPhoneNumber(member.phone),
				messagingServiceSid: Meteor.settings.twilio.copilotSid
			}).then(response => {
				console.log({
					at: moment().format('YYYY-MM-DD HH:mm:ss:SS'),
					messageType: 'text',
					to: response.to,
					status: response.status
				})
			}).catch(error => console.error(error))

			texts.push(text)
		})
		return texts
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

		console.log({ memberEmail: memberEmails[0] })
		const messages = memberEmails.map(member => {
			return {
				to: member.email,
				from: message.from || 'powered@thebatterysf.com',
				subject: message.subject,
				html: messageBuilder(member)
			}
		})
		console.log({ message: messages[0] })

		sendMassEmail(messages)
		/************************************* ************************************/
		const  ms = 2000 // Minimum delay between sending

		// Rate limit sending emails
		const bound = Meteor.bindEnvironment(callback => callback())

		/*let i = 0
		const interval = setInterval(() => {
			try {
				bound(() => Email.send({
					to: memberEmails[i].email,
					from: message.from,
					subject: message.subject,
					html: messageBuilder(memberEmails[i])
				}))
				console.log({ at: moment().format('YYYY-MM-DD HH:mm:ss:SS'), messageType: 'email', to: memberEmails[i].email })
			} catch(e) {
				console.error(e, { to: memberEmails[i].email })
			}
			
			if(++i >= memberEmails.length) clearInterval(interval)
		}, ms)*/

		// Original synchronous burst send
		/*memberEmails.forEach(member => {
			try {
				const email = Email.send({
					to: member.email,
					from: message.from || 'support@thebatterysf.com',
					subject: message.subject,
					html: messageBuilder(member)
				})
			} catch(e) {
				console.error(e, { to: member.email })
			}
		})*/
		
		/*sgMail.setApiKey(process.env.SENDGRID_API_KEY)
		const msg1 = {
			to: 'avram@thebatterysf.com',
			from: 'powered@thebatterysf.com',
			subject: 'Sending with Twilio SendGrid is Fun',
			text: 'and easy to do anywhere, even with Node.js',
			html: '<strong>and easy to do anywhere, even with Node.js</strong>',
		}
		const msg2 = {
			to: 'avram@thebatterysf.com',
			from: 'support@thebatterysf.com',
			subject: 'Sending with Twilio SendGrid is Fun YEAH',
			text: 'and easy to do anywhere, even with Node.js',
			html: '<strong>and easy to do anywhere, even with Node.js</strong>',
		}
		const response = sgMail.send([msg1, msg2])
		response.then(result => console.log({ result })).catch(e => console.error({ Error: e }))*/
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
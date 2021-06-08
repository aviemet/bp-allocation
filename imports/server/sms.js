import { Meteor } from 'meteor/meteor'
import { formatPhoneNumber } from '/imports/lib/utils'
import { Themes } from '/imports/api/db'

import '/imports/api/methods'
import twilio from 'twilio'

// Meteor publication definitions
import '/imports/server/publications'
import moment from 'moment'
import { PresentationSettings, MemberThemes } from '/imports/api/db'

import { setMessageSendingFlag, setMessageSentFlag } from './messageMethods'
import { textVotingLink } from '/imports/lib/utils'

const memberPhoneNumbersQuery = (themeId, members) => {
	const match = {
		$match: {
			'member.email': { $ne: null }
		}
	}

	// Coerce members into an array
	if(typeof members == 'string') members = [members]

	// Constrain results to member ids if provided
	if(Array.isArray(members)) {
		// An empty array should return no results
		if(members.length === 0) return []

		match.$match['member._id'] = { $in: members }
	}

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
		match,
		{
			$project: {
				_id: 1,
				phone: '$member.phone',
				code: '$member.code'
			}
		}
	])
}

const client = twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken)

const messageBuilder = (member, message, slug) => {
	let finalMessage = message.body
	if(message.includeLink === true && slug) {
		finalMessage += textVotingLink(slug, member.code)
	}
	return finalMessage
}

// client.messages.create returns a promise, but I've wrapped it in another promise so that I could send a
// tuple back with the failure case. The catch method returns { error, member } to be used in retries
const smsToMember = (member, message, slug) => {
	return new Promise((resolve, reject) => {
		client.messages.create({
			body: messageBuilder(member, message, slug),
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

const textVotingLinkToMembers = ({ themeId, message, members }) => {
	const theme = Themes.findOne({ _id: themeId })
	const settings = PresentationSettings.findOne({ _id: theme.presentationSettings })

	setMessageSendingFlag(theme, message)

	const memberPhoneNumbers = memberPhoneNumbersQuery(themeId, members)

	const rateLimitMs = settings.twilioRateLimit || 100
	const retryLimit = 2

	// Uses setInterval to rate limit sending texts to Twilio
	const sendTextsWithRetry = async members => {
		const failedTexts = []

		let i = 0
		const interval = await setInterval(() => {
			smsToMember(members[i++], message, theme.slug).catch(({ error, member }) => {
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

				setMessageSentFlag(theme, message)
			}
		}, rateLimitMs)
	}

	sendTextsWithRetry(memberPhoneNumbers)
}

export default textVotingLinkToMembers

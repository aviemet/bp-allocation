import { Meteor } from 'meteor/meteor'
import { formatPhoneNumber } from '/imports/lib/utils'
import { Themes } from '/imports/api/db'

import '/imports/api/methods'
import twilio from 'twilio'

// Meteor publication definitions
import '/imports/server/publications'
import moment from 'moment'
import { PresentationSettings, MemberThemes } from '/imports/api/db'

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

const client = twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken)

const messageBuilder = (member, message, slug) => {
	let finalMessage = message.body
	if(message.includeLink === true && slug) {
		// eslint-disable-next-line quotes
		finalMessage += "\n" + `${process.env.HOST_NAME}/v/${slug}/${member.code}`
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

const textVotingLinkToMembers = ({ themeId, message }) => {
	const theme = Themes.findOne({ _id: themeId })
	const settings = PresentationSettings.findOne({ _id: theme.presentationSettings })

	// Mark the message as "sending"
	if(theme.messagesStatus.find(status => status.messageId === message._id)) {
		Themes.update({ _id: themeId, 'messagesStatus.messageId': message._id }, { $set: { 'messagesStatus.$':{ messageId: message._id, sending: false, sent: true } } })
	} else {
		Themes.update({ _id: themeId }, { $push: { 'messagesStatus': { messageId: message._id, sending: true, sent:false } } })
	}

	const memberPhoneNumbers = memberPhoneNumbersQuery(themeId)

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
			}
		}, rateLimitMs)

		return i
	}

	sendTextsWithRetry(memberPhoneNumbers).then(response => console.log({ response }))
}

export default textVotingLinkToMembers









const asyncInterval = async (callback, ms, triesLeft = 5) => {
	return new Promise((resolve, reject) => {
		const interval = setInterval(async () => {
			if(await callback) {
				resolve()
				clearInterval(interval)
			} else if(triesLeft <= 1) {
				reject()
				clearInterval(interval)
			}
			triesLeft--
		}, ms)
	})
}

/*
using setinterval can we push a promise into a promise.all?
*/

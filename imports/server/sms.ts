import { format } from "date-fns"
import { Meteor } from "meteor/meteor"
import twilio from "twilio"

import { Themes, Members, MemberThemes, PresentationSettings } from "/imports/api/db"
import "/imports/api/methods"
import "/imports/server/publications"
import { setMessageSendingFlag, setMessageSentFlag } from "./messageMethods"
import { textVotingLink, formatPhoneNumber } from "/imports/lib/utils"

const memberPhoneNumbersQuery = (themeId, members, skipRounds) => {
	const match = {
		$match: {
			"member.phone": { $ne: null },
		},
	}

	if(skipRounds?.one) {
		match.$match.chitVotes = []
	}

	if(skipRounds?.two) {
		match.$match.allocations = []
	}

	// Coerce members into an array
	if(typeof members === "string") members = [members]

	// Constrain results to member ids if provided
	if(Array.isArray(members)) {
		// An empty array should return no results
		if(members.length === 0) return []

		match.$match["member._id"] = { $in: members }
	}

	return MemberThemes.rawCollection().aggregate([
		{
			$match: {
				theme: themeId,
			},
		},
		{
			$lookup: {
				from: "members",
				localField: "member",
				foreignField: "_id",
				as: "member",
			},
		},
		{ $unwind: "$member" },
		match,
		{
			$project: {
				_id: 1,
				phone: "$member.phone",
				code: "$member.code",
			},
		},
	]).toArray()
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
			messagingServiceSid: Meteor.settings.twilio.copilotSid,
		}).then(response => {
			console.log({
				at: format(new Date(), "y-MM-dd HH:mm:ss:SS"),
				messageType: "text",
				to: response.to,
				status: response.status,
			})
			resolve(response)
		}).catch(error => {
			reject({ error, member })
		})
	})
}

// TODO: Unhandled promise rejection errors
const textVotingLinkToMembers = ({ themeId, message, members }) => {
	if(members === undefined) {
		members = Members.find(
			{ "theme.theme": themeId },
			{ sort: { number: 1 } }
		)
	}

	const theme = Themes.findOne({ _id: themeId })
	const settings = PresentationSettings.findOne({ _id: theme.presentationSettings })

	setMessageSendingFlag(theme, message)

	const memberPhoneNumbers = memberPhoneNumbersQuery(themeId, members, message.optOutRounds)

	const rateLimitMs = settings.twilioRateLimit || 100
	const retryLimit = 2

	// Uses setInterval to rate limit sending texts to Twilio
	const sendTextsWithRetry = async numbers => {
		const failedTexts = []

		let i = 0
		const interval = await setInterval(() => {
			smsToMember(numbers[i++], message, theme.slug).catch(({ error, member }) => {
				console.log({ error, member })
				const retry = member.hasOwnProperty("retry") ? member.retry + 1 : 0
				if(retry <= retryLimit) {
					failedTexts.push(Object.assign(member, { retry }))
				}
			})

			if(i >= numbers.length) {
				clearInterval(interval)

				if(failedTexts.length > 0) {
					console.log("retry")
					sendTextsWithRetry(failedTexts)
				}

				setMessageSentFlag(theme, message)
			}
		}, rateLimitMs)
	}

	sendTextsWithRetry(memberPhoneNumbers)
}

export default textVotingLinkToMembers

import { format } from "date-fns"
import { Meteor } from "meteor/meteor"
import twilio from "twilio"

import { Themes, Members, MemberThemes, PresentationSettings } from "/imports/api/db"
import "/imports/api/methods"
import "/imports/server/publications"
import { setMessageSendingFlag, setMessageSentFlag } from "./messageMethods"
import { textVotingLink, formatPhoneNumber } from "/imports/lib/utils"
import { type Message, type Rounds } from "/imports/types/schema"
import { coerceArray } from "../lib/collections"

interface MemberPhoneLookupResult {
	_id: string
	phone: string
	code?: string
}

const memberPhoneNumbersQuery = async(themeId: string, members?: unknown, skipRounds?: Rounds): Promise<MemberPhoneLookupResult[]> => {
	const match: { $match: Record<string, unknown> } = {
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

	const ids = coerceArray(members)
	if(ids.length === 0) return []
	match.$match["member._id"] = { $in: ids }

	const raw = await MemberThemes.rawCollection().aggregate([
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

	const results: MemberPhoneLookupResult[] = []
	for(const doc of raw as Array<Record<string, unknown>>) {
		const idValue = (doc as Record<string, unknown>)["_id"]
		const phoneValue = (doc as Record<string, unknown>)["phone"]
		const codeValue = (doc as Record<string, unknown>)["code"]
		if(typeof idValue === "string" && typeof phoneValue === "string") {
			results.push({ _id: idValue, phone: phoneValue, code: typeof codeValue === "string" ? codeValue : undefined })
		}
	}

	return results
}

const client = twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken)


const messageBuilder = (member: { code?: string }, message: Message, slug?: string) => {
	let finalMessage = message.body || ""
	if(message.includeLink === true && slug && member.code) {
		finalMessage += textVotingLink(slug, member.code)
	}
	return finalMessage
}

// client.messages.create returns a promise, but I've wrapped it in another promise so that I could send a
// tuple back with the failure case. The catch method returns { error, member } to be used in retries
const smsToMember = (member: { phone: string, code?: string, retry?: number }, message: Message, slug?: string) => {
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
interface SmsParams {
	themeId: string
	message: Message
	members?: unknown
}

const textVotingLinkToMembers = async({ themeId, message, members }: SmsParams) => {
	if(members === undefined) {
		const allMembers = await Members.find({ "theme.theme": themeId }, { sort: { number: 1 } }).fetchAsync()
		members = allMembers.map(m => m._id)
	}

	const theme = await Themes.findOneAsync({ _id: themeId })
	const settings = theme?.presentationSettings ? await PresentationSettings.findOneAsync({ _id: theme.presentationSettings }) : undefined

	setMessageSendingFlag(theme, message)

	const memberPhoneNumbers = await memberPhoneNumbersQuery(themeId, members, message.optOutRounds)

	const rateLimitMs = (settings?.twilioRateLimit) || 100
	const retryLimit = 2

	// Uses setInterval to rate limit sending texts to Twilio
	const sendTextsWithRetry = async(numbers: MemberPhoneLookupResult[]) => {
		const failedTexts: MemberPhoneLookupResult[] = []

		let i = 0
		const interval = await setInterval(() => {
			smsToMember(numbers[i++], message, theme?.slug).catch(({ error, member }) => {
				console.log({ error, member })
				const retry = Object.prototype.hasOwnProperty.call(member, "retry") ? (member.retry || 0) + 1 : 0
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

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

export interface MemberPhoneLookupResult {
	_id: string
	phone: string
	code?: string
}

interface MemberWithRetry extends MemberPhoneLookupResult {
	retry?: number
}

export interface SmsMessageCreateParams {
	body: string
	to: string
	messagingServiceSid: string
}

export interface SmsMessageResponse {
	status?: string | null
	to?: string | null
}

export interface SmsMessagesApi {
	create: (params: SmsMessageCreateParams) => Promise<SmsMessageResponse>
}

export interface SmsClient {
	messages: SmsMessagesApi
}

type MemberPhoneNumbersQuery = (themeId: string, members?: unknown, skipRounds?: Rounds) => Promise<MemberPhoneLookupResult[]>

const createDefaultSmsClient = (): SmsClient => {
	return twilio(Meteor.settings.twilio.accountSid, Meteor.settings.twilio.authToken)
}

let client: SmsClient = createDefaultSmsClient()

export const setSmsClient = (customClient: SmsClient) => {
	client = customClient
}

export const getSmsClient = (): SmsClient => client

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null

const extractResponseField = (response: unknown, field: "status" | "to") => {
	if(!isRecord(response)) {
		return null
	}
	const value = response[field]
	if(typeof value === "string") {
		return value
	}
	if(value === null) {
		return null
	}
	return null
}

const isMemberWithRetry = (value: unknown): value is MemberWithRetry => {
	if(!isRecord(value)) {
		return false
	}
	const record: Record<string, unknown> = value
	if(typeof record._id !== "string") {
		return false
	}
	if(typeof record.phone !== "string") {
		return false
	}
	const codeValue = record.code
	if(codeValue !== undefined && typeof codeValue !== "string") {
		return false
	}
	const retryValue = record.retry
	if(retryValue !== undefined && typeof retryValue !== "number") {
		return false
	}
	return true
}

const isSmsFailureObject = (value: unknown): value is { error: unknown, member?: MemberWithRetry } => {
	if(!isRecord(value)) {
		return false
	}
	const record: Record<string, unknown> = value
	if(!Object.prototype.hasOwnProperty.call(record, "error")) {
		return false
	}
	if(Object.prototype.hasOwnProperty.call(record, "member")) {
		const memberValue = record.member
		if(memberValue !== undefined && !isMemberWithRetry(memberValue)) {
			return false
		}
	}
	return true
}

const defaultMemberPhoneNumbersQuery: MemberPhoneNumbersQuery = async (themeId, members, skipRounds) => {
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

let memberPhoneNumbersQuery: MemberPhoneNumbersQuery = defaultMemberPhoneNumbersQuery

export const setMemberPhoneNumbersQuery = (customQuery: MemberPhoneNumbersQuery) => {
	memberPhoneNumbersQuery = customQuery
}

export const resetMemberPhoneNumbersQuery = () => {
	memberPhoneNumbersQuery = defaultMemberPhoneNumbersQuery
}

const delay = (ms: number) => new Promise<void>(resolve => {
	if(ms <= 0) {
		resolve()
		return
	}
	setTimeout(resolve, ms)
})

const messageBuilder = (member: { code?: string }, message: Message, slug?: string) => {
	let finalMessage = message.body || ""
	if(message.includeLink === true && slug && member.code) {
		finalMessage += textVotingLink(slug, member.code)
	}
	return finalMessage
}

// client.messages.create returns a promise, but I've wrapped it in another promise so that I could send a
// tuple back with the failure case. The catch method returns { error, member } to be used in retries
const smsToMember = (member: MemberWithRetry, message: Message, slug?: string) => {
	const messageBody = messageBuilder(member, message, slug)
	const logContext = {
		at: format(new Date(), "y-MM-dd HH:mm:ss:SS"),
		messageType: "text",
		to: formatPhoneNumber(member.phone),
		body: messageBody,
		messageId: message._id,
	}

	return new Promise<SmsMessageResponse>((resolve, reject) => {
		try {
			console.log({ ...logContext, status: "pending" })
			client.messages.create({
				body: messageBody,
				to: logContext.to,
				messagingServiceSid: Meteor.settings.twilio.copilotSid,
			}).then(response => {
				const responseStatus = extractResponseField(response, "status")
				const responseTo = extractResponseField(response, "to")
				console.log({ ...logContext, status: responseStatus, responseTo, response })
				resolve(response)
			}).catch(error => {
				console.log({ ...logContext, status: "failed", error })
				reject({ error, member })
			})
		} catch (error) {
			console.log({ ...logContext, status: "failed", error })
			reject({ error, member })
		}
	})
}

// TODO: Unhandled promise rejection errors
interface SmsParams {
	themeId: string
	message: Message
	members?: unknown
}

const textVotingLinkToMembers = async ({ themeId, message, members }: SmsParams) => {
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

	console.log({
		at: format(new Date(), "y-MM-dd HH:mm:ss:SS"),
		action: "textVotingLinkToMembers:start",
		themeId,
		messageId: message._id,
		memberCount: memberPhoneNumbers.length,
		rateLimitMs,
		retryLimit,
	})

	const sendTextsWithRetry = async (numbers: MemberWithRetry[]): Promise<void> => {
		if(numbers.length === 0) {
			return
		}

		const failedTexts: MemberWithRetry[] = []

		for(let index = 0; index < numbers.length; index += 1) {
			const currentMember = numbers[index]
			if(index > 0 || currentMember.retry !== undefined) {
				await delay(rateLimitMs)
			}

			try {
				await smsToMember(currentMember, message, theme?.slug)
			} catch (failure) {
				const failureDetails = isSmsFailureObject(failure) ? failure : undefined
				const failureError = failureDetails ? failureDetails.error : failure
				const failureMember = failureDetails?.member ?? currentMember

				console.log({
					at: format(new Date(), "y-MM-dd HH:mm:ss:SS"),
					action: "textVotingLinkToMembers:failure",
					error: failureError,
					member: failureMember,
					messageId: message._id,
				})

				const memberHasRetry = Object.prototype.hasOwnProperty.call(failureMember, "retry")
				const retryCount = memberHasRetry ? ((failureMember.retry ?? 0) + 1) : 0
				if(retryCount <= retryLimit) {
					failedTexts.push({ ...failureMember, retry: retryCount })
				}
			}
		}

		if(failedTexts.length > 0) {
			console.log({
				at: format(new Date(), "y-MM-dd HH:mm:ss:SS"),
				action: "textVotingLinkToMembers:retry",
				count: failedTexts.length,
				messageId: message._id,
			})
			await delay(rateLimitMs)
			await sendTextsWithRetry(failedTexts)
		}
	}

	if(memberPhoneNumbers.length === 0) {
		console.log({
			at: format(new Date(), "y-MM-dd HH:mm:ss:SS"),
			action: "textVotingLinkToMembers:no-recipients",
			themeId,
			messageId: message._id,
		})
		await setMessageSentFlag(theme, message)
		return
	}

	await sendTextsWithRetry(memberPhoneNumbers)
	await setMessageSentFlag(theme, message)
}

export default textVotingLinkToMembers

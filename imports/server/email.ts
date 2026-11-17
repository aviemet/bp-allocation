import sgMail, { type MailDataRequired } from "@sendgrid/mail"
import { Meteor } from "meteor/meteor"
import { Themes, MemberThemes } from "/imports/api/db"
import "/imports/api/methods"
import "/imports/server/publications"

import { setMessageSendingFlag, setMessageSentFlag, setMessageErrorFlag } from "./messageMethods"
import { emailLog as log } from "/imports/lib/logging"
import { emailVotingLink } from "/imports/lib/utils"
import { coerceArray } from "/imports/lib/utils"
import { type Message, type Rounds } from "/imports/types/schema"

sgMail.setApiKey(Meteor.settings.SENDGRID_API_KEY)

export interface EmailSendResponse {
	statusCode?: number
}

export type EmailBatchSender = (
	messages: MailDataRequired[],
) => Promise<[EmailSendResponse, Record<string, unknown>]>

const defaultEmailBatchSender: EmailBatchSender = async messages => {
	const [clientResponse, responseBody] = await sgMail.send(messages)
	return [clientResponse, responseBody]
}

let sendEmailBatch: EmailBatchSender = defaultEmailBatchSender

export const getEmailBatchSender = (): EmailBatchSender => sendEmailBatch

export const setEmailBatchSender = (sender: EmailBatchSender): void => {
	sendEmailBatch = sender
}

export const resetEmailBatchSender = (): void => {
	sendEmailBatch = defaultEmailBatchSender
}

const htmlEmailWrapper = (emailBody: string) => `<html><head><style> 
	img { 
		max-width: 100% !important;
		margin: 4px;
		padding: 4px;
		background-color: #FFF;
		border: solid 1px #CCC;
		border-radius: 2px;
	} 
</style></head><body><div style="max-width: 600px; margin: 0 auto;">${emailBody}</div></body></html>`

interface MemberEmailLookupResult {
	_id: string
	email?: string
	code?: string
}

const memberEmailsQuery = async (themeId: string, members?: string | string[], skipRounds?: Rounds) => {
	const match: { $match: Record<string, unknown> } = {
		$match: {
			"member.email": { $ne: null },
		},
	}

	if(skipRounds?.one) {
		match.$match.chitVotes = []
	}

	if(skipRounds?.two) {
		match.$match.allocations = []
	}

	members = coerceArray(members)
	if(members.length === 0) return []

	match.$match["member._id"] = { $in: members }


	return await MemberThemes.rawCollection().aggregate<MemberEmailLookupResult>([
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
				email: "$member.email",
				code: "$member.code",
			},
		},
	]).toArray()
}

const validEmail = (email: string | null | undefined) => {
	if(!email) return false

	return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

const messageBuilder = (memberCode: string | undefined, body: string | undefined, slug: string | undefined, includeLink: boolean | undefined) => {
	let finalMessage = body || ""
	if(includeLink === true && slug && memberCode) {
		finalMessage += emailVotingLink(slug, memberCode)
	}
	return htmlEmailWrapper(finalMessage)
}

interface EmailVotingParams {
	themeId: string
	message: Message & { from?: string }
	members?: string | string[]
}

export const emailVotingLinkToMembers = async ({ themeId, message, members }: EmailVotingParams) => {
	const theme = await Themes.findOneAsync({ _id: themeId })
	const invalidEmailMembers: MemberEmailLookupResult[] = []

	await setMessageSendingFlag(theme, message)

	const memberEmails = await memberEmailsQuery(themeId, members, message.optOutRounds)

	const messages: MailDataRequired[] = memberEmails.flatMap((member: MemberEmailLookupResult) => {
		if(!validEmail(member.email)) {
			invalidEmailMembers.push(member)
			return []
		}
		const mail = {
			to: member.email!.trim().toLowerCase(),
			from: message.from || "Battery Powered <powered@thebatterysf.com>",
			subject: message.subject || "",
			html: messageBuilder(member.code, message.body, theme?.slug, message.includeLink),
		}
		return [mail]
	})

	try {
		const [clientResponse] = await sendEmailBatch(messages)
		await setMessageSentFlag(theme, message)
		log.info("batch.sent", "Email batch sent", {
			themeId,
			meta: {
				messageId: message._id,
				sent: messages.map(mail => mail.to),
				totalSent: messages.length,
				statusCode: clientResponse?.statusCode,
			},
		})
	} catch (error) {
		log.error("send.failure", "Email send failed", error, { themeId, meta: { messageId: message._id } })

		if(isRecord(error) && "response" in error) {
			await setMessageErrorFlag(theme, message)
			log.error("send.failure", "SendGrid response body for failed email", undefined, {
				themeId,
				meta: { messageId: message._id, responseBody: Reflect.get(error, "response") },
			})
		}
	}

	if(invalidEmailMembers.length > 0) {
		log.warn("invalid-recipients", "Some members had invalid emails", {
			themeId,
			meta: { messageId: message._id, invalidEmailMembers },
		})
	}
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null
}

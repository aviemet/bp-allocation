import sgMail, { type MailDataRequired } from "@sendgrid/mail"
import { Meteor } from "meteor/meteor"
import { Themes, MemberThemes } from "/imports/api/db"
import "/imports/api/methods"
import "/imports/server/publications"

import { setMessageSendingFlag, setMessageSentFlag, setMessageErrorFlag } from "./messageMethods"
import { emailVotingLink } from "/imports/lib/utils"
import { coerceArray } from "../lib/collections"
import { type Message, type Rounds } from "/imports/types/schema"


sgMail.setApiKey(Meteor.settings.SENDGRID_API_KEY)

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

const emailVotingLinkToMembers = async ({ themeId, message, members }: EmailVotingParams) => {
	const theme = await Themes.findOneAsync({ _id: themeId })
	const invalidEmailMembers: MemberEmailLookupResult[] = []

	setMessageSendingFlag(theme, message)

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
		console.log({
			action: "email-message-prepared",
			messageId: message._id,
			memberThemeId: member._id,
			to: mail.to,
			from: mail.from,
			subject: mail.subject,
			includeLink: message.includeLink === true,
			hasBody: !!message.body,
			bodyLength: message.body ? message.body.length : 0,
			themeId,
		})
		return [mail]
	})

	const sentMail = sgMail.send(messages)

	sentMail.then(([clientResponse, responseBody]) => {
		setMessageSentFlag(theme, message)
		console.log({
			action: "email-batch-sent",
			messageId: message._id,
			themeId,
			sent: messages.map(m => m.to),
			totalSent: messages.length,
			statusCode: clientResponse?.statusCode,
			headers: clientResponse?.headers,
			responseBody,
		})
	}, error => {
		console.error(error)

		if(error.response) {
			setMessageErrorFlag(theme, message)
			console.error(error.response.body)
		}
	})

	// Log invalid emails
	if(invalidEmailMembers.length > 0) console.error({ invalidEmailMembers })
}

export default emailVotingLinkToMembers

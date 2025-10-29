import sgMail, { type MailDataRequired } from "@sendgrid/mail"
import { Meteor } from "meteor/meteor"
import { Themes, MemberThemes, type ThemeData } from "/imports/api/db"
import "/imports/api/methods"
import "/imports/server/publications"

import { setMessageSendingFlag, setMessageSentFlag, setMessageErrorFlag } from "./messageMethods"
import { emailVotingLink } from "/imports/lib/utils"
import { type Message, type Rounds } from "/imports/types/schema"
import { coerceArray } from "../lib/collections"


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

const memberEmailsQuery = async(themeId: string, members?: string | string[], skipRounds?: Rounds) => {
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

const emailVotingLinkToMembers = async({ themeId, message, members }: EmailVotingParams) => {
	const theme = Themes.findOne({ _id: themeId }) as ThemeData | undefined
	const invalidEmailMembers: MemberEmailLookupResult[] = []

	setMessageSendingFlag(theme, message)

	const memberEmails = await memberEmailsQuery(themeId, members, message.optOutRounds)

	const messages: MailDataRequired[] = memberEmails.flatMap((member: MemberEmailLookupResult) => {
		if(!validEmail(member.email)) {
			invalidEmailMembers.push(member)
			return []
		}
		return [{
			to: member.email!.trim().toLowerCase(),
			from: message.from || "Battery Powered <powered@thebatterysf.com>",
			subject: message.subject || "",
			html: messageBuilder(member.code, message.body, theme?.slug, message.includeLink),
		}]
	})

	const sentMail = sgMail.send(messages)

	sentMail.then(() => {
		setMessageSentFlag(theme, message)
		console.log({ sent: messages.map(m => m.to) })
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

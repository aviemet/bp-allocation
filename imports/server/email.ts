import { Meteor } from "meteor/meteor"
import { Themes, MemberThemes } from "/imports/api/db"
import "/imports/api/methods"
import "/imports/server/publications"

import { setMessageSendingFlag, setMessageSentFlag, setMessageErrorFlag } from "./messageMethods"
import { emailVotingLink } from "/imports/lib/utils"

import sgMail from "@sendgrid/mail"

sgMail.setApiKey(Meteor.settings.SENDGRID_API_KEY)

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

const memberEmailsQuery = (themeId, members, skipRounds) => {
	const match = {
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
				email: "$member.email",
				code: "$member.code",
			},
		},
	]).toArray()
}

const validEmail = email => {
	if(!email) return false
	return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

const messageBuilder = (memberCode, body, slug, includeLink) => {
	let finalMessage = body
	if(includeLink === true && slug) {
		finalMessage += emailVotingLink(slug, memberCode)
	}
	return htmlEmailWrapper(finalMessage)
}

const emailVotingLinkToMembers = ({ themeId, message, members }) => {
	const theme = Themes.findOne({ _id: themeId })
	const invalidEmailMembers = []

	setMessageSendingFlag(theme, message)

	const memberEmails = memberEmailsQuery(themeId, members, message.optOutRounds)

	const messages = memberEmails.flatMap(member => {
		if(!validEmail(member.email)) {
			invalidEmailMembers.push(member)
			return []
		}
		return [{
			to: member.email.trim().toLowerCase(),
			from: message.from || "Battery Powered <powered@thebatterysf.com>",
			subject: message.subject,
			html: messageBuilder(member.code, message.body, theme.slug, message.includeLink),
		}]
	})

	const sentMail = sgMail.send(messages)

	sentMail.then(response => {
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

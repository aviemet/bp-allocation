import { Meteor } from 'meteor/meteor'
import { Themes, MemberThemes } from '/imports/api/db'
import '/imports/api/methods'
import '/imports/server/publications'

import { setMessageSendingFlag, setMessageSentFlag, setMessageErrorFlag } from './messageMethods'
import { emailVotingLink } from '/imports/lib/utils'

import sgMail from '@sendgrid/mail'
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

const validEmail = email => {
	if(!email) return false
	return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

const emailVotingLinkToMembers = ({ themeId, message }) => {
	const theme = Themes.findOne({ _id: themeId })
	const invalidEmailMembers = []

	setMessageSendingFlag(theme, message)

	const messageBuilder = member => {
		let finalMessage = message.body
		if(message.includeLink === true && theme.slug) {
			finalMessage += emailVotingLink(theme.slug, member.code)
		}
		return htmlEmailWrapper(finalMessage)
	}

	const memberEmails = memberEmailsQuery(themeId)

	const messages = memberEmails.flatMap(member => {
		if(!validEmail(member.email)) {
			invalidEmailMembers.push(member)
			return []
		}
		return [{
			to: member.email.trim().toLowerCase(),
			from: message.from || 'Battery Powered <powered@thebatterysf.com>',
			subject: message.subject,
			html: messageBuilder(member)
		}]
	})

	const sentMail = sgMail.send(messages)

	sentMail.then(response => {
		setMessageSentFlag(theme, message)
	}, error => {
		console.error(error)

		if (error.response) {
			setMessageErrorFlag(theme, message)
			console.error(error.response.body)
		}
	})

	// Log invalid emails
	console.error({ invalidEmailMembers })
}

export default emailVotingLinkToMembers

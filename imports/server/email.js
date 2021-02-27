import { Themes, MemberThemes } from '/imports/api/db'

import '/imports/api/methods'

// Meteor publication definitions
import '/imports/server/publications'
import { Messages } from '/imports/api/db'

import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


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

const emailVotingLinkToMembers = ({ themeId, message }) => {
	const theme = Themes.findOne({ _id: themeId }) // Just need the slug from the theme

	const messageBuilder = member => {
		let finalMessage = message.body
		if(message.includeLink === true && theme.slug) {
			finalMessage += `<p style='text-align: center; height: 4rem;'><a style='font-family: Arial, sans-serif; font-size: 2rem; padding: 15px; margin-bottom: 10px; border: 1px solid #CCC; border-radius: 10px; background-color: green; color: white; text-decoration: none;' href='${process.env.HOST_NAME}/v/${theme.slug}/${member.code}'>Vote Here</a></p>`
		}
		return htmlEmailWrapper(finalMessage)
	}

	const memberEmails = memberEmailsQuery(themeId)

	const messages = memberEmails.map(member => {
		return {
			to: member.email,
			from: message.from || 'powered@thebatterysf.com',
			subject: message.subject,
			html: messageBuilder(member)
		}
	})

	const sentMail = sgMail.send(messages)

	sentMail.then(response => {
		// TODO: Not even close to correct
		Messages.update({ _id: messages._id }, { $set: { sent: true } })
	}, error => {
		console.error(error)

		if (error.response) {
			console.error(error.response.body)
		}
	})
}

export default emailVotingLinkToMembers

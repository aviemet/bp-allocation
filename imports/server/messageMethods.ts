import { Themes } from "/imports/api/db"

export const setMessageSendingFlag = async(theme, message) => {
	const data = { messageId: message._id, sending: true, sent: false, error: false }

	if(theme?.messagesStatus?.find(status => status.messageId === message._id)) {
		await Themes.update({ _id: theme._id, "messagesStatus.messageId": message._id }, { $set: { "messagesStatus.$": data } })
	} else {
		await Themes.update({ _id: theme._id }, { $push: { "messagesStatus": data } })
	}
}

export const setMessageSentFlag = async(theme, message) => {
	const data = { messageId: message._id, sending: false, sent: true, error: false }
	await Themes.update({ _id: theme._id, "messagesStatus.messageId": message._id }, { $set: { "messagesStatus.$": data } })
}

export const setMessageErrorFlag = async(theme, message) => {
	const data = { messageId: message._id, sending: false, sent: false, error: true }
	await Themes.update({ _id: theme._id, "messagesStatus.messageId": message._id }, { $set: { "messagesStatus.$": data } })
}

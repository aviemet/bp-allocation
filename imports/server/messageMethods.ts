import { Themes, type ThemeData } from "/imports/api/db"
import { type Message } from "/imports/types/schema"

export const setMessageSendingFlag = async(theme: ThemeData | undefined, message: Message) => {
	if(!theme) return
	const data = { messageId: message._id, sending: true, sent: false, error: false }

	if(theme?.messagesStatus?.find(status => status.messageId === message._id)) {
		await Themes.updateAsync({ _id: theme._id, "messagesStatus.messageId": message._id }, { $set: { "messagesStatus.$": data } })
	} else {
		await Themes.updateAsync({ _id: theme._id }, { $push: { "messagesStatus": data } })
	}
}

export const setMessageSentFlag = async(theme: ThemeData | undefined, message: Message) => {
	if(!theme) return
	const data = { messageId: message._id, sending: false, sent: true, error: false }
	await Themes.updateAsync({ _id: theme._id, "messagesStatus.messageId": message._id }, { $set: { "messagesStatus.$": data } })
}

export const setMessageErrorFlag = async(theme: ThemeData | undefined, message: Message) => {
	if(!theme) return
	const data = { messageId: message._id, sending: false, sent: false, error: true }
	await Themes.updateAsync({ _id: theme._id, "messagesStatus.messageId": message._id }, { $set: { "messagesStatus.$": data } })
}

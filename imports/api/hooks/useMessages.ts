import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { useTheme } from "./useTheme"
import { Messages, type MessageData } from "../db"
import { useData } from "../providers/DataProvider"

export const useMessages = () => {
	const data = useData()
	const themeId = data?.themeId
	const { themeLoading } = useTheme()

	return useTracker(() => {
		if(!themeId || themeLoading) {
			return {
				messages: [] as MessageData[],
				messagesLoading: true,
			}
		}

		const subscription = Meteor.subscribe("messages", themeId)
		const subscriptionReady = subscription.ready()
		const messages = Messages.find().fetch()

		return {
			messages,
			messagesLoading: !subscriptionReady,
		}
	}, [themeId, themeLoading])
}

export const useMessage = (messageId: string) => {
	const data = useData()
	const themeId = data?.themeId
	const { themeLoading } = useTheme()

	return useTracker(() => {
		if(!themeId || !messageId || themeLoading) {
			return {
				message: undefined,
				messageLoading: true,
			}
		}

		const subscription = Meteor.subscribe("messages", themeId)
		const subscriptionReady = subscription.ready()
		const message = Messages.findOne({ _id: messageId })

		return {
			message: message as MessageData | undefined,
			messageLoading: !subscriptionReady,
		}
	}, [themeId, messageId, themeLoading])
}


import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { useData } from "../providers/DataProvider"
import { useTheme } from "./useTheme"
import { Messages, type MessageData } from "../db"

export const useMessages = () => {
	const data = useData()
	const themeId = data?.themeId
	const { isLoading: themeLoading } = useTheme()

	return useTracker(() => {
		if(!themeId || themeLoading) {
			return {
				values: [] as MessageData[],
				isLoading: true,
			}
		}

		const subscription = Meteor.subscribe("messages", themeId)
		const subscriptionReady = subscription.ready()
		const messages = Messages.find().fetch()

		return {
			values: messages,
			isLoading: !subscriptionReady,
		}
	}, [themeId, themeLoading])
}

export const useMessage = (messageId: string) => {
	const data = useData()
	const themeId = data?.themeId
	const { isLoading: themeLoading } = useTheme()

	return useTracker(() => {
		if(!themeId || !messageId || themeLoading) {
			return {
				message: undefined,
				isLoading: true,
			}
		}

		const subscription = Meteor.subscribe("messages", themeId)
		const subscriptionReady = subscription.ready()
		const message = Messages.findOne({ _id: messageId })

		return {
			message: message as MessageData | undefined,
			isLoading: !subscriptionReady,
		}
	}, [themeId, messageId, themeLoading])
}


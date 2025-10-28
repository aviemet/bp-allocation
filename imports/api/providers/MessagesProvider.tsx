import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { observer } from "mobx-react-lite"
import React from "react"

import { useData } from "./DataProvider"
import { useTheme } from "./ThemeProvider"
import { Messages, type MessageData } from "/imports/api/db"
import { MessagesCollection } from "/imports/api/stores"
import { createContext } from "/imports/lib/hooks/createContext"

interface MessagesContextValue {
	messages?: MessagesCollection
	isLoading: boolean
}

const [useMessages, MessagesContextProvider] = createContext<MessagesContextValue>()
export { useMessages }

// Get a single message
export const useMessage = (messageId: string) => {
	const messagesContext = useMessages()

	if(!messagesContext) {
		throw new Error("useMessage must be used within a MessagesProvider")
	}

	if(messagesContext.isLoading) {
		return { message: null, isLoading: true }
	}

	return {
		message: messagesContext.messages?.values.find(message => message._id === messageId) || null,
		isLoading: false,
	}
}

interface MessagesProviderProps {
	children: React.ReactNode
}

const MessagesProvider = observer(({ children }: MessagesProviderProps) => {
	const appStore = useData()
	const themeId = appStore?.themeId
	const themeContext = useTheme()
	const themeLoading = themeContext?.isLoading || false

	let subscription: Meteor.SubscriptionHandle | undefined
	let handleObserver: Meteor.LiveQueryHandle | undefined
	let messagesCollection: MessagesCollection | undefined

	const messages = useTracker(() => {
		if(!themeId || themeLoading) {
			if(subscription) subscription.stop()
			if(handleObserver) handleObserver.stop()

			return {
				isLoading: true,
				messages: undefined,
			}
		}

		subscription = Meteor.subscribe("messages", themeId, {
			onReady: () => {
				const cursor = Messages.find({ })
				messagesCollection = new MessagesCollection(cursor.fetch())

				handleObserver = cursor.observe({
					added: (messages: MessageData) => messagesCollection?.refreshData(messages),
					changed: (messages: MessageData) => messagesCollection?.refreshData(messages),
					removed: (messages: MessageData) => messagesCollection?.deleteItem(messages),
				})
			},
		})

		return {
			messages: messagesCollection,
			isLoading: !subscription?.ready(),
		}
	}, [themeId, themeLoading])

	return (
		<MessagesContextProvider value={ messages }>
			{ children }
		</MessagesContextProvider>
	)
})

export default MessagesProvider

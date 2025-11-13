import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import React, { useRef } from "react"

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

const MessagesProvider = ({ children }: MessagesProviderProps) => {
	const appStore = useData()
	const themeId = appStore?.themeId
	const themeContext = useTheme()
	const themeLoading = themeContext?.isLoading || false

	const subscriptionRef = useRef<Meteor.SubscriptionHandle | undefined>(undefined)
	const handleObserverRef = useRef<Meteor.LiveQueryHandle | undefined>(undefined)
	const messagesCollectionRef = useRef<MessagesCollection | undefined>(undefined)

	const messages = useTracker(() => {
		if(!themeId || themeLoading) {
			subscriptionRef.current?.stop()
			handleObserverRef.current?.stop()

			return {
				isLoading: true,
				messages: undefined,
			}
		}

		subscriptionRef.current?.stop()
		subscriptionRef.current = Meteor.subscribe("messages", themeId, {
			onReady: () => {
				const cursor = Messages.find({ })
				messagesCollectionRef.current = new MessagesCollection(cursor.fetch())

				handleObserverRef.current = cursor.observe({
					added: (messages: MessageData) => messagesCollectionRef.current?.refreshData(messages),
					changed: (messages: MessageData) => messagesCollectionRef.current?.refreshData(messages),
					removed: (messages: MessageData) => messagesCollectionRef.current?.deleteItem(messages),
				})
			},
		})

		if(subscriptionRef.current.ready() && !messagesCollectionRef.current) {
			const cursor = Messages.find({ })
			messagesCollectionRef.current = new MessagesCollection(cursor.fetch())

			handleObserverRef.current?.stop()
			handleObserverRef.current = cursor.observe({
				added: (messages: MessageData) => messagesCollectionRef.current?.refreshData(messages),
				changed: (messages: MessageData) => messagesCollectionRef.current?.refreshData(messages),
				removed: (messages: MessageData) => messagesCollectionRef.current?.deleteItem(messages),
			})
		}

		return {
			messages: messagesCollectionRef.current,
			isLoading: !subscriptionRef.current?.ready() || !messagesCollectionRef.current,
		}
	}, [themeId, themeLoading])

	return (
		<MessagesContextProvider value={ messages }>
			{ children }
		</MessagesContextProvider>
	)
}

export default MessagesProvider

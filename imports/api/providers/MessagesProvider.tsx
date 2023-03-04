import { Meteor } from 'meteor/meteor'
import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite'

import { useTracker } from 'meteor/react-meteor-data'
import { useData } from './DataProvider'
import { useTheme } from './ThemeProvider'
import { Messages } from '/imports/api/db'
import { MessagesCollection, MessageStore } from '/imports/api/stores'

const MessagesContext = React.createContext<{
	messages?: MessageStore
	isLoding: boolean
} | undefined>(undefined)

interface IMessagesProviderProps {
	children: React.ReactNode
}

const MessagesProvider = observer(({ children }: IMessagesProviderProps) => {
	const { themeId } = useData()
	const { isLoading: themeLoading } = useTheme()

	let subscription: Meteor.SubscriptionHandle
	let cursorObserver: Meteor.LiveQueryHandle
	let messagesCollection: MessagesCollection | undefined

	const messages = useTracker(() => {
		if(!themeId  || themeLoading) {
			if(subscription) subscription.stop()
			if(cursorObserver) cursorObserver.stop()

			return {
				isLoading: true,
				messages: undefined,
			}
		}

		subscription = Meteor.subscribe('messages', themeId, {
			onReady: () => {
				const cursor = Messages.find({ })
				messagesCollection = new MessagesCollection(cursor.fetch(), MessageStore)

				cursorObserver = cursor.observe({
					added: messages => messagesCollection.refreshData(messages),
					changed: messages => messagesCollection.refreshData(messages),
					removed: messages => messagesCollection.deleteItem(messages),
				})
			},
		})

		return {
			messages: messagesCollection,
			isLoading: !subscription.ready(),
		}
	}, [themeId, themeLoading])

	return (
		<MessagesContext.Provider value={ messages }>
			{ children }
		</MessagesContext.Provider>
	)
})

export const useMessages = () => useContext(MessagesContext)

export const useMessage = (messageId: string) => {
	const { messages, isLoading } = useContext(MessagesContext)

	if(isLoading) return { message: null, isLoading }

	return { message: messages.values.find(message => message._id === messageId ) }
}

export default MessagesProvider

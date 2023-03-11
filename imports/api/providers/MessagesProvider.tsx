import { Meteor } from 'meteor/meteor'
import React from 'react'
import { observer } from 'mobx-react-lite'

import { useTracker } from 'meteor/react-meteor-data'
import { useData } from './DataProvider'
import { useTheme } from './ThemeProvider'
import { Messages } from '/imports/api/db'
import { MessagesCollection } from '/imports/api/stores'
import { createContext } from '/imports/lib/hooks'

const [useMessages, MessagesContextProvider] = createContext<{
	messages: MessagesCollection
	isLoading: boolean
}>()
export { useMessages }

interface IMessagesProviderProps {
	children: React.ReactNode
}

const MessagesProvider = observer(({ children }: IMessagesProviderProps) => {
	const { themeId } = useData()
	const { isLoading: themeLoading } = useTheme()

	let subscription: Meteor.SubscriptionHandle
	let cursorObserver: Meteor.LiveQueryHandle
	let messagesCollection: MessagesCollection

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
				messagesCollection = new MessagesCollection(cursor.fetch())

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
		<MessagesContextProvider value={ messages }>
			{ children }
		</MessagesContextProvider>
	)
})

// export const useMessages = () => useContext(MessagesContext)

export const useMessage = (messageId: string) => {
	const { messages, isLoading } = useMessages()

	if(isLoading) return { message: null, isLoading }

	return { message: messages.values.find(message => message._id === messageId ) }
}

export default MessagesProvider

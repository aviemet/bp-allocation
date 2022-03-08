import { Meteor } from 'meteor/meteor'
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react-lite'

import { useTracker } from 'meteor/react-meteor-data'
import { useData } from './DataProvider'
import { useTheme } from './ThemeProvider'
import { Messages } from '/imports/api/db'
import { MessagesCollection, MessageStore } from '/imports/api/stores'

const MessagesContext = React.createContext('messages')

const MessagesProvider = observer(({ children }) => {
	const { themeId } = useData()
	const { isLoading: themeLoading } = useTheme()

	let subscription
	let handleObserver
	let messagesCollection // The MobX store for the settings

	const messages = useTracker(() => {
		if(!themeId  || themeLoading) {
			if(subscription) subscription.stop()
			if(handleObserver) handleObserver.stop()

			return {
				isLoading: true,
				messages: undefined
			}
		}

		subscription = Meteor.subscribe('messages', themeId, {
			onReady: () => {
				const cursor = Messages.find({ })
				messagesCollection = new MessagesCollection(cursor.fetch(), MessageStore)

				handleObserver = cursor.observe({
					added: messages => messagesCollection.refreshData(messages),
					changed: messages => messagesCollection.refreshData(messages),
					removed: messages => messagesCollection.deleteItem(messages)
				})
			}
		})

		return {
			messages: messagesCollection,
			isLoading: !subscription.ready()
		}
	}, [themeId, themeLoading])

	return (
		<MessagesContext.Provider value={ messages }>
			{ children }
		</MessagesContext.Provider>
	)
})

MessagesProvider.propTypes = {
	children: PropTypes.any
}

export const useMessages = () => useContext(MessagesContext)

export const useMessage = messageId => {
	const { messages, isLoading } = useContext(MessagesContext)

	if(isLoading) return { message: null, isLoading }

	return { message: messages.values.find(message => message._id === messageId ) }
}

export default MessagesProvider

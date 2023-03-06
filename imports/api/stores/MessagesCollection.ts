import TrackableCollection from './lib/TrackableCollection'
import MessageStore from './MessageStore'

class MessagesCollection extends TrackableCollection<Message> {
	constructor(data: Message[]) {
		super(data, MessageStore)
	}
}

export default MessagesCollection

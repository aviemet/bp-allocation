import TrackableCollection from "./lib/TrackableCollection"
import MessageStore from "./MessageStore"
import { MessageData } from "/imports/api/db"

class MessagesCollection extends TrackableCollection<MessageStore> {
	constructor(data: MessageData[]) {
		super(data, MessageStore)
	}
}

export default MessagesCollection

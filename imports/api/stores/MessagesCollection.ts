import TrackableCollection from "./lib/TrackableCollection"
import { TrackableData } from "./lib/TrackableStore"
import MessageStore from "./MessageStore"
import { Message } from "/imports/api/db/generated-types"

interface MessageData extends Message, TrackableData {}

class MessagesCollection extends TrackableCollection<MessageStore> {
	constructor(data: MessageData[]) {
		super(data, MessageStore as any)
	}
}

export default MessagesCollection

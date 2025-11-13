import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Message } from "/imports/types/schema"

export type MessageData = TrackableData<Message>

class MessageStore extends TrackableStore<MessageData> {
	dirty = false
	originalMessage = ""

	constructor(data: MessageData) {
		super(data)
		this.originalMessage = data.body || ""
	}
}

interface MessageStore extends MessageData {}

export default MessageStore

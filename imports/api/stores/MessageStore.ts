import { makeObservable, observable } from "mobx"

import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Message } from "/imports/types/schema"

interface MessageData extends Message, TrackableData {}

class MessageStore extends TrackableStore<MessageData> {
	dirty = false
	originalMessage = ""

	constructor(data: MessageData) {
		super(data)

		makeObservable(this, {
			dirty: observable,
		})

		this.originalMessage = data.body || ""
	}
}

export default MessageStore

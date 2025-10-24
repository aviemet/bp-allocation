import { makeObservable, observable } from "mobx"
import TrackableStore from "./lib/TrackableStore"

class MessageStore extends TrackableStore {
	dirty = false
	originalMessage = ""

	constructor(data) {
		super(data)

		makeObservable(this, {
			dirty: observable,
		})

		this.originalMessage = data.body
	}
}

export default MessageStore

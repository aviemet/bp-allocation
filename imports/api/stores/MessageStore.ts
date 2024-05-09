import { makeObservable, observable } from 'mobx'
import TrackableStore from './lib/TrackableStore'

interface MessageStore extends Schema.Message {}

class MessageStore extends TrackableStore<MessageStore> implements MessageStore {
	dirty = false
	originalMessage = ''

	constructor(data: Schema.Message) {
		super(data)

		makeObservable(this, {
			dirty: observable,
		})

		this.originalMessage = data.body
	}
}

export default MessageStore

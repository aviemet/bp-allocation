import { observable } from 'mobx'
import TrackableStore from './lib/TrackableStore'

class MessageStore extends TrackableStore {
	@observable dirty = false
	originalMessage = ''

	constructor(data) {
		super(data)

		this.originalMessage = data.body
	}
}

export default MessageStore
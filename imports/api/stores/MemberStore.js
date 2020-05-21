import { computed } from 'mobx'
import TrackableStore from './lib/TrackableStore'

class MemberStore extends TrackableStore {
	@computed
	get formattedName() {
		if(this.fullName) return this.fullName
		return `${this.firstName} ${this.lastName}`
	}
}

export default MemberStore
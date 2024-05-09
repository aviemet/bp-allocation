import { computed, makeObservable } from 'mobx'
import TrackableStore from './lib/TrackableStore'

interface MemberStore extends Schema.Member {}

class MemberStore extends TrackableStore<MemberStore> implements MemberStore {
	constructor(data: Partial<MemberStore>) {
		super(data)

		makeObservable(this, {
			formattedName: computed,
		})
	}

	get formattedName() {
		if(this.fullName) return this.fullName
		return `${this.firstName} ${this.lastName}`
	}
}

export default MemberStore

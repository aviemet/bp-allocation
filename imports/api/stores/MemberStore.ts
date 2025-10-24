import { computed, makeObservable } from "mobx"
import TrackableStore from "./lib/TrackableStore"

class MemberStore extends TrackableStore {
	constructor(data) {
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

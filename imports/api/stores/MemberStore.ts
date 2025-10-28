import { computed, makeObservable } from "mobx"

import TrackableStore, { TrackableData, TrackableStoreWithData } from "./lib/TrackableStore"
import { Member } from "/imports/types/schema"

export interface MemberData extends Member, TrackableData {}

class MemberStore extends TrackableStore<MemberData> {
	constructor(data: MemberData) {
		super(data)
		makeObservable(this, {
			formattedName: computed,
		})
	}

	get formattedName(): string {
		const self = this as unknown as TrackableStoreWithData<MemberData>
		if(self.fullName) return self.fullName
		return `${self.firstName} ${self.lastName}`
	}
}

export default MemberStore

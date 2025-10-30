import { computed, makeObservable } from "mobx"

import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Member } from "/imports/types/schema"

export type MemberData = TrackableData<Member>

class MemberStore extends TrackableStore<MemberData> {
	constructor(data: MemberData) {
		super(data)
		makeObservable(this, {
			formattedName: computed,
		})
	}

	get formattedName(): string {
		if(this.fullName) return this.fullName
		return `${this.firstName} ${this.lastName}`
	}
}

interface MemberStore extends MemberData {}

export default MemberStore

import { remove } from "lodash"
import { action, makeObservable } from "mobx"

import TrackableCollection from "./lib/TrackableCollection"
import { TrackableData } from "./lib/TrackableStore"
import MemberThemeStore from "./MemberThemeStore"
import { MemberTheme } from "/imports/api/db/generated-types"

interface MemberThemeData extends MemberTheme, TrackableData {}

class MembersThemesCollection extends TrackableCollection<MemberThemeStore> {
	constructor(data: MemberThemeData[]) {
		super(data, MemberThemeStore as new (data: TrackableData) => MemberThemeStore)
		makeObservable(this, {
			deleteItem: action,
		})
	}

	deleteItem(data: TrackableData) {
		const memberTheme = data as unknown as MemberTheme
		remove((this as unknown as { parent: { members: { values: Array<{ _id: string }> } } }).parent.members.values, member => member._id === memberTheme.member)
		remove(this.values, _memberTheme => _memberTheme._id === memberTheme._id)
	}
}

export default MembersThemesCollection

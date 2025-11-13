import { remove } from "lodash"

import TrackableCollection from "./lib/TrackableCollection"
import MemberThemeStore, { MemberThemeData } from "./MemberThemeStore"

class MembersThemesCollection extends TrackableCollection<MemberThemeStore> {
	constructor(data: MemberThemeData[]) {
		super(data, MemberThemeStore)
	}

	deleteItem(data: MemberThemeData) {
		const memberTheme = data
		remove((this as unknown as { parent: { members: { values: Array<{ _id: string }> } } }).parent.members.values, member => member._id === memberTheme.member)
		remove(this.values, _memberTheme => _memberTheme._id === memberTheme._id)
	}
}

export default MembersThemesCollection

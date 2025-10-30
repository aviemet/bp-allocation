import TrackableCollection from "./lib/TrackableCollection"
import MemberStore, { MemberData } from "./MemberStore"

class MembersCollection extends TrackableCollection<MemberStore> {
	searchableFields = ["firstName", "lastName", "fullName", "code", "initials", "number", "phone"]

	constructor(data: MemberData[]) {
		super(data, MemberStore)
	}
}

export default MembersCollection

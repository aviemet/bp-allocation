import TrackableCollection from "./lib/TrackableCollection"
import MemberStore from "./MemberStore"
import { MemberData } from "/imports/api/db"

class MembersCollection extends TrackableCollection<MemberStore> {
	searchableFields = ["firstName", "lastName", "fullName", "code", "initials", "number", "phone"]

	constructor(data: MemberData[]) {
		super(data, MemberStore)
	}
}

export default MembersCollection

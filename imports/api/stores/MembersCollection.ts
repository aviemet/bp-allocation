import TrackableCollection from "./lib/TrackableCollection"
import MemberStore from "./MemberStore"

class MembersCollection extends TrackableCollection<MemberStore> {
	searchableFields = ["firstName", "lastName", "fullName", "code", "initials", "number", "phone"]
}

export default MembersCollection

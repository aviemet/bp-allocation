import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Organization } from "/imports/types/schema"

interface OrgData extends Organization, TrackableData {}

class OrgStore extends TrackableStore<OrgData> {
	constructor(data: OrgData) {
		super(data)
	}
}

export default OrgStore

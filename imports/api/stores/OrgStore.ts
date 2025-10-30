import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Organization } from "/imports/types/schema"

export type OrgData = TrackableData<Organization>

class OrgStore extends TrackableStore<OrgData> {
	constructor(data: OrgData) {
		super(data)
	}
}

interface OrgStore extends OrgData {}

export default OrgStore

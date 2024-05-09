import TrackableStore from './lib/TrackableStore'

interface OrgStore extends Schema.Organization {}

class OrgStore extends TrackableStore<OrgStore> implements OrgStore {
	constructor(data: Schema.Organization) {
		super(data)
	}
}

export default OrgStore

import TrackableStore from './lib/TrackableStore'

interface OrgStore extends Organization {}

class OrgStore extends TrackableStore<OrgStore> implements OrgStore {
	constructor(data: Partial<OrgStore>) {
		super(data)
	}
}

export default OrgStore

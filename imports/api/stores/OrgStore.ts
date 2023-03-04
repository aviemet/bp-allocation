import TrackableStore from './lib/TrackableStore'

interface OrgStore extends Organization {}

class OrgStore extends TrackableStore<OrgStore> implements OrgStore {}

export default OrgStore

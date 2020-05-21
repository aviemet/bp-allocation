import TrackableCollection from './lib/TrackableCollection'

class MembersCollection extends TrackableCollection {
	searchableFields = ['firstName', 'lastName', 'fullName', 'code', 'initials', 'number', 'phone']
}

export default MembersCollection
import TrackableCollection from './lib/TrackableCollection'

class MembersCollection extends TrackableCollection<Member> {
	searchableFields = ['firstName', 'lastName', 'fullName', 'code', 'initials', 'number', 'phone']
}

export default MembersCollection

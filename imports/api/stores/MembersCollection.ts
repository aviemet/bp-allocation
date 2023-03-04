// import MemberStore from './MemberStore'
import TrackableCollection from './lib/TrackableCollection'

class MembersCollection extends TrackableCollection<Member> {
	searchableFields = ['firstName', 'lastName', 'fullName', 'code', 'initials', 'number', 'phone']
}

export default MembersCollection

// const m = new MembersCollection([{
// 	_id: 'lkj',
// 	firstName: 'ok',
// 	lastName: 'up',
// 	fullName: 'oko',
// 	code: 'ok',
// 	email: 'oko',
// 	initials: 'klj',
// 	number: 888,
// 	phone: '90sldkf',
// 	createdAt: new Date(),
// }], MemberStore)


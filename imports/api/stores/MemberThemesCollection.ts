import TrackableCollection from './lib/TrackableCollection'
import { action, makeObservable } from 'mobx'
import { remove } from 'lodash'
import MemberThemeStore from './MemberThemeStore'

class MembersThemesCollection extends TrackableCollection<MemberTheme> {
	constructor(data: MemberTheme[]) {
		super(data, MemberThemeStore)

		makeObservable(this, {
			deleteItem: action,
		})
	}

	deleteItem(memberTheme: MemberTheme) {
		remove(this.parent.members.values, member => member._id === memberTheme.member)
		remove(this.values, _memberTheme => _memberTheme._id === memberTheme._id)
	}
}

export default MembersThemesCollection

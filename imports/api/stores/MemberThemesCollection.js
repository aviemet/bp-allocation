import TrackableCollection from './lib/TrackableCollection'
import { action, makeObservable } from 'mobx'
import { remove } from 'lodash'

class MembersThemesCollection extends TrackableCollection {
	constructor(data) {
		super(data)
		makeObservable(this, {
			deleteItem: action
		})
	}

	deleteItem(memberTheme) {
		remove(this.parent.members.values, member => member._id === memberTheme.member)
		remove(this.values, _memberTheme => _memberTheme._id === memberTheme._id)
	}
}

export default MembersThemesCollection
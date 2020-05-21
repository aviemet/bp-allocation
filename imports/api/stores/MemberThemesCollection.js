import TrackableCollection from './lib/TrackableCollection'
import { action } from 'mobx'
import { remove } from 'lodash'

class MembersThemesCollection extends TrackableCollection {
	@action
	deleteItem(memberTheme) {
		remove(this.parent.members.values, member => member._id === memberTheme.member)
		remove(this.values, _memberTheme => _memberTheme._id === memberTheme._id)
	}
}

export default MembersThemesCollection
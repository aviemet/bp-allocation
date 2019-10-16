import { Meteor } from 'meteor/meteor';
import TrackableCollection from './TrackableCollection';
import { observable, computed, action, autorun, toJS } from 'mobx';
import { MemberThemes, Members } from '/imports/api';
import _ from 'lodash';

class MembersThemesCollection extends TrackableCollection {
	@action
	deleteItem(memberTheme) {
		debugger;
		_.remove(this.parent.members.values, member => member._id === memberTheme.member);
		_.remove(this.values, _memberTheme => _memberTheme._id === memberTheme._id);
	}
}

export default MembersThemesCollection;
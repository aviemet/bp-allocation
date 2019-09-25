import TrackableCollection from './TrackableCollection';
import { observable, computed, action } from 'mobx';
import { MemberThemes, Members } from '/imports/api';
import _ from 'lodash';

class MembersCollection extends TrackableCollection {
/*	@action
	updateMember(member) {
		let memberClone = _.cloneDeep(member);
		delete memberClone.theme;
		this.refreshData(memberClone);
	}

	@action
	updateMemberTheme(memberTheme) {
		let i = _.findIndex(this.values, value => value._id === memberTheme.member );
		if(i >= 0) {
			for(let [ key, value ] of Object.entries(memberTheme)) {
				if(this.values[i].theme[key] !== value) {
					this.values[i].theme[key] = value;
				}
			}
		}
	}*/
}

export default MembersCollection;
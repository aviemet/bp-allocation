import { Meteor } from 'meteor/meteor';
import TrackableCollection from './TrackableCollection';
import { observable, computed, action, autorun, toJS } from 'mobx';
import { MemberThemes, Members } from '/imports/api';
import _ from 'lodash';

class MembersThemesCollection extends TrackableCollection {

	/*@action
	loadData = autorun(() => {
		console.log({ this: this });
		const memberIds = this.values.map(memberTheme => toJS(memberTheme).member);

		if(this.parent.subscriptions.members && this.parent.observers.members) {
			this.parent.subscriptions.members.stop();
			this.parent.observers.members.stop();

			this.parent.subscriptions.members = Meteor.subscribe('members', memberIds, {
				onReady: () => {
					const membersCursor = Members.find({ _id: { $in: memberIds }});
					const members = membersCursor.fetch();
					this.parent.members.refreshData(members);
					console.log({ members });
					this.parent.observers.members = membersCursor.observe({
						added: members => this.parent.members.refreshData(members),
						changed: members => this.parent.members.refreshData(members)
					});
				}
			});
		}
	})*/
}

export default MembersThemesCollection;
import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { withTracker } from 'meteor/react-meteor-data';
import { Themes, PresentationSettings, Organizations, MemberThemes, Members, Images } from '/imports/api';

const AppTracker = withTracker(({ themeId }) => {

	// Store all handles in one object 
	let handles = {};
	let values = {
		theme: undefined,
		settings: undefined,
		orgs: undefined,
		memberThemes: undefined,
		members: undefined,
		images: undefined
	};

	if(themeId) {
		// Subscribe to data which requires a themeId
		handles.theme         = Meteor.subscribe('themes', themeId);
		handles.orgs          = Meteor.subscribe('organizations', themeId);
		handles.memberThemes  = Meteor.subscribe('memberThemes', themeId);

		if(handles.theme.ready() && handles.orgs.ready() && handles.memberThemes.ready()) {
			// Fetch the data when the subscriptions are ready
			values.theme        = Themes.find({ _id: themeId }).fetch()[0];
			values.orgs         = Organizations.find({ theme: themeId }).fetch();
			values.memberThemes = MemberThemes.find({ theme: themeId }).fetch();

			if(values.theme && values.orgs && values.memberThemes) {
				// Use the fetched data to subscribe to and fetch the remaining data
				handles.settings  = Meteor.subscribe('presentationSettings', values.theme.presentationSettings);
				values.settings   = PresentationSettings.find({ _id: values.theme.presentationSettings }).fetch()[0];
  
				let memberIds     = values.memberThemes.map(memberTheme => memberTheme.member);
				handles.members   = Meteor.subscribe('members', memberIds);
				values.members    = Members.find({ _id: { $in: memberIds }}).fetch();
  
				let imgIds        = values.orgs.map((org) => ( org.image ));
				handles.images    = Meteor.subscribe('images', imgIds);

				if(!_.isEmpty(imgIds)){
					values.images   = Images.find({ _id: { $in: imgIds }}).fetch();
				}
			}
		}
	}

	let handlesLoading = Object.values(handles).some(handle => !handle.ready());
	let valuesLoading  = Object.values(values).some(value => _.isUndefined(value));

	return {
		loading: handlesLoading || valuesLoading,
		...values
	};
});

export default AppTracker;

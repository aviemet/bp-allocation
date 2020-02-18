import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';

import { useTracker } from 'meteor/react-meteor-data';
import { useData } from './DataProvider';
import { Members } from '/imports/api/db';
import { MembersCollection, MemberStore } from '/imports/api/stores';

const MembersContext = React.createContext('members');
export const useMembers = () => useContext(MembersContext);

const MembersProvider = observer(props => {
	const data = useData();

	const members = useTracker(() => {
		if(!data.themeId) return {
			isLoading: true,
			members: undefined
		};

		let membersCollection;
		const subscription = Meteor.subscribe('members', data.themeId, {
			onReady: () => {
				const membersCursor = Members.find({ 'theme.theme': data.themeId });
				const results = membersCursor.fetch();

				membersCollection = new MembersCollection(results, MemberStore);

				membersCursor.observe({
					added: members => membersCollection.refreshData(members),
					changed: members => membersCollection.refreshData(members)
				});
			}
		});

		return {
			members: membersCollection,
			isLoading: !subscription.ready()
		};

	}, [data.themeId]);

	return (
		<MembersContext.Provider value={ members }>
			{ props.children }
		</MembersContext.Provider>
	);

});

MembersProvider.propTypes = {
	children: PropTypes.any
};

export default MembersProvider;
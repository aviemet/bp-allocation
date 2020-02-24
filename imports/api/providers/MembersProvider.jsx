import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';

import { useData } from './DataProvider';
import { Members } from '/imports/api/db';
import { MembersCollection, MemberStore } from '/imports/api/stores';

const MembersContext = React.createContext('members');

export const useMember = props => {
	return useContext(MembersContext);
};

export const useMembers = props => {
	// console.log({ MembersContext });
	return useContext(MembersContext);
};

const MembersProvider = observer(props => {
	const { themeId } = useData();
	let subscription;
	let observer;
	let membersCollection; // The MobX store for the members


	const members = useTracker(() => {
		if(!themeId) {
			if(subscription) subscription.stop();
			if(observer) observer.stop();

			return {
				isLoading: true,
				members: undefined
			};
		}

		subscription = Meteor.subscribe('members', themeId, {
			onReady: () => {
				const cursor = Members.find({ 'theme.theme': themeId });
				membersCollection = new MembersCollection(cursor.fetch(), MemberStore);

				cursor.observe({
					added: members => membersCollection.refreshData(members),
					changed: members => membersCollection.refreshData(members),
					removed: members => membersCollection.refreshData(members)
				});
			}
		});

		return {
			members: membersCollection,
			isLoading: !subscription.ready()
		};

	}, [themeId]);

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
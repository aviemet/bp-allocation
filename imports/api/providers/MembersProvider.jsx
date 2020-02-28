import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';

import { useData } from './DataProvider';
import { Members } from '/imports/api/db';
import { MembersCollection, MemberStore } from '/imports/api/stores';

const MembersContext = React.createContext('members');

const MembersProvider = observer(props => {
	const { themeId } = useData();
	let subscription;
	let observer;
	let membersCollection; // MobX store for members collection
	// let memberStore; // MobX store for single member

	// limit of 0 == 'return no records', limit of false == 'no limit'
	const [ subLimit, setSubLimit ] = useState(0);
	// const [ subIndex, setSubIndex ] = useState(0);

	const [ renderCount, setRenderCount ] = useState(0);

	const getAllMembers = () => {
		setSubLimit(false);
	};

	const hideAllMembers = () => {
		setSubLimit(0);
	};

	const methods = { getAllMembers, hideAllMembers };

	const members = useTracker(() => {
		console.log({ subLimit });
		if(!themeId || subLimit === 0) {
			if(subscription) subscription.stop();
			if(observer) observer.stop();

			return Object.assign(methods, {
				isLoading: subLimit === 0 ? false : true,
				members: {}
			});
		}
		
		subscription = Meteor.subscribe('members', { themeId, limit: subLimit }, {
			onReady: () => {
				const cursor = Members.find(
					{ 'theme.theme': themeId },
					{ sort: { number: 1 } }
				);
				membersCollection = new MembersCollection(cursor.fetch(), MemberStore);

				cursor.observe({
					added: members => membersCollection.refreshData(members),
					changed: members => membersCollection.refreshData(members),
					removed: members => membersCollection.refreshData(members)
				});
				// Used to force re-render
				setRenderCount(renderCount + 1);
			}
		});

		// subscription = Meteor.subscribe('member', { memberId }, {
		// 	onReady: () => {
		// 		const cursor = Members.find({ _id: memberId });
		// 		memberStore = new MemberStore(cursor.fetch());
		// 	}
		// })

		return Object.assign(methods, {
			members: membersCollection,
			isLoading: !subscription.ready()
		});

	// subIndex and subLimit changes cause subscription to update
	}, [themeId, subLimit]);

	return (
		<MembersContext.Provider value={ members } render={ renderCount /* used to force re-render */ }>
			{ props.children }
		</MembersContext.Provider>
	);

});

MembersProvider.propTypes = {
	children: PropTypes.any
};

// Get a single member
export const useMember = ({ memberId }) => {
	const membersContext = useContext(MembersContext);

	return membersContext;
};

// Get all members
export const useMembers = props => {
	const membersContext = useContext(MembersContext);

	// Unsibscribe from members upon unmounting page
	useEffect(() => {
		membersContext.getAllMembers();
		return () => {
			membersContext.hideAllMembers();
		};
	}, []);
	
	return membersContext;
};

export default MembersProvider;
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
	let cursorObserver;
	let membersCollection; // MobX store for members collection

	// limit of 0 == 'return no records', limit of false == 'no limit'
	const [ subLimit, setSubLimit ] = useState(0);
	// const [ subIndex, setSubIndex ] = useState(0);

	const [ renderCount, setRenderCount ] = useState(0);
	const [ memberId, setMemberId ] = useState(false);

	const getAllMembers = () => setSubLimit(false);
	const hideAllMembers = () => setSubLimit(0);

	const methods = { getAllMembers, hideAllMembers, setMemberId };

	// Method to be called when subscription is ready
	const subscriptionReady = cursor => {
		membersCollection = new MembersCollection(cursor.fetch(), MemberStore);

		cursorObserver = cursor.observe({
			added: members => membersCollection.refreshData(members),
			changed: members => membersCollection.refreshData(members),
			removed: members => membersCollection.refreshData(members)
		});
		// Used to force re-render
		setRenderCount(renderCount + 1);
	};

	const members = useTracker(() => {	
		// Return a single user if memberId is set
		if(memberId) {
			subscription = Meteor.subscribe('member', { memberId, themeId }, {
				onReady: () => {
					subscriptionReady(Members.find({ }));
				}
			});
		// Return all users if no memberId
		} else {
			// Return loading or uninitialized placeholder data
			if(!themeId || subLimit === 0) {
				if(subscription) subscription.stop();
				if(cursorObserver) cursorObserver.stop();
				
				return Object.assign(methods, {
					isLoading: subLimit === 0 ? false : true,
					members: undefined
				});
			}

			subscription = Meteor.subscribe('members', { themeId, limit: subLimit }, {
				onReady: () => {
					subscriptionReady(Members.find(
						{ 'theme.theme': themeId },
						{ sort: { number: 1 } }
					));
				}
			});
		}

		return Object.assign(methods, {
			members: membersCollection,
			isLoading: !subscription.ready()
		});

	}, [themeId, subLimit, memberId]);

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
export const useMember = (memberId) => {
	const membersContext = useContext(MembersContext);
	membersContext.setMemberId(memberId);
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
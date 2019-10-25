import { Meteor } from 'meteor/meteor';
import React from 'react';
import { useData } from '/imports/stores/DataProvider';
import { Button } from 'semantic-ui-react';

const TextMembersButton = props => {
	const { theme, members, orgs } = useData();

	const textMembers = () => {
		members.values.forEach(member => {
			if(member.phone) {
				const message = `From Battery Powered:\n\nVoting is open for 20 minutes! Your fellow members in the room at Allocation Night have narrowed the ${orgs.values.length} finalists down to ${theme.numTopOrgs}. Use this link to allocate the funds you already donated for this theme to the organizations you want to support:\n\nhttps://www.batterysf.com/voting/${theme._id}/${member._id}`;

				Meteor.call('sendMessage', member.phone, message);
			}
		});
	};

	return <Button onClick={ textMembers } { ...props }>Text Members</Button>;
};

export default TextMembersButton;
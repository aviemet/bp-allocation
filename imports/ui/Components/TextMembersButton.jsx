import { Meteor } from 'meteor/meteor';
import React from 'react';
import { useData } from '/imports/stores/DataProvider';
import { Button } from 'semantic-ui-react';

const TextMembersButton = props => {
	const { theme, members } = useData();

	const textMembers = () => {
		members.values.forEach(member => {
			if(member.phone) {
				const message = `Battery Powered Allocation Voting: Please follow the link to vote for your favorite organizations: https://www.batterysf.com/voting/${theme._id}/${member._id}`;

				Meteor.call('sendMessage', member.phone, message);
			}
		});
	};

	return <Button onClick={ textMembers } { ...props }>Text Members</Button>;
};

export default TextMembersButton;
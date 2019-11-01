import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';

import { useData } from '/imports/stores/DataProvider';
import { Button } from 'semantic-ui-react';

const TextMembersButton = ({ message, title, ...rest }) => {
	const { theme, members, orgs } = useData();

	const textMembers = () => {
		members.values.forEach(member => {
			if(member.phone) {
				const link = `https://www.batterysf.com/voting/${theme._id}/${member._id}`;
				const messageWithLink = `${message}\n\n${link}`;

				Meteor.call('sendMessage', member.phone, messageWithLink);
			}
		});
	};

	return <Button onClick={ textMembers } { ...rest }>{ title || 'Send Text' }</Button>;
};

TextMembersButton.propTypes = {
	message: PropTypes.string,
	title: PropTypes.string,
	rest: PropTypes.any
};

export default TextMembersButton;
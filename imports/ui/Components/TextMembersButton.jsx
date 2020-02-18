import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';

import { useTheme, useMembers } from '/imports/api/providers';
import { Button } from 'semantic-ui-react';

const TextMembersButton = ({ message, title, link, ...rest }) => {
	const { theme } = useTheme();
	const { members } = useMembers();

	const textMembers = () => {
		members.values.forEach(member => {
			if(member.phone) {
				const votingLink = `www.batterysf.com/v/${theme.slug}/${member.code}`;
				let finalMessage = message;
				// eslint-disable-next-line quotes
				if(link !== false) finalMessage += "\n" + votingLink;

				Meteor.call('sendMessage', member.phone, finalMessage);
			}
		});
	};

	return <Button onClick={ textMembers } { ...rest }>{ title || 'Send Text' }</Button>;
};

TextMembersButton.propTypes = {
	message: PropTypes.string,
	title: PropTypes.string,
	link: PropTypes.bool,
	rest: PropTypes.any
};

export default TextMembersButton;
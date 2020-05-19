import React from 'react';
import PropTypes from 'prop-types';
import { MessageMethods } from '/imports/api/methods';

import { Checkbox } from 'semantic-ui-react';

const includeVotingLinkToggle = ({ message }) => {
	const saveValue = (e, data) => {
		MessageMethods.update.call({
			id: message._id,
			data: {
				active: data.checked
			}
		});
	};

	return(
		<Checkbox
			toggle
			onClick={ saveValue }
			checked={ message.active || false }
		/>
	);
};

includeVotingLinkToggle.propTypes = {
	message: PropTypes.object.isRequired
};

export default includeVotingLinkToggle;
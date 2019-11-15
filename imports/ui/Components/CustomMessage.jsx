import React from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react'
import styled from 'styled-components';
import usePortal from '/imports/lib/usePortal';

const CustomMessage = ({ heading, body, onDismiss }) => {
	const target = usePortal('message');

	return createPortal(
		<Error negative onDismiss={ onDismiss }>
			<Message.Header>{ heading }</Message.Header>
			{ typeof body === 'string' ? <p>{ body }</p> : body }
		</Error>,
		target
	);
};

const Error = styled(Message)`
	&& {
		position: fixed;
		top: 30px;
		left: 50%;
		transform: translateX(-50%);
		text-align: center;
	}
`;

CustomMessage.propTypes = {
	heading: PropTypes.string.isRequired,
	body: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.func,
		PropTypes.node
	]).isRequired,
	onDismiss: PropTypes.func.isRequired
};

export default CustomMessage;
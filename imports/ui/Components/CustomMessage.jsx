import React from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { Message } from 'semantic-ui-react'
import styled from '@emotion/styled'
import usePortal from '/imports/lib/usePortal'

const CustomMessage = ({ heading, body, onDismiss, ...rest }) => {
	const target = usePortal('message')

	return createPortal(
		<FixedMessage
			onDismiss={ onDismiss }
			{ ...rest }
		>
			<Message.Header>{ heading }</Message.Header>
			{ typeof body === 'string' ? <p>{ body }</p> : body }
		</FixedMessage>,
		target
	)
}

const FixedMessage = styled(Message)`
	&& {
		position: fixed;
		top: 30px;
		left: 50%;
		transform: translateX(-50%);
		text-align: center;
	}
`

CustomMessage.propTypes = {
	heading: PropTypes.string.isRequired,
	body: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.func,
		PropTypes.node
	]).isRequired,
	onDismiss: PropTypes.func.isRequired,
	rest: PropTypes.any
}

export default CustomMessage
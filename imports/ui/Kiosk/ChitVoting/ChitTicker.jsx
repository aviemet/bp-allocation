import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { useVoting } from '/imports/ui/Kiosk/VotingContext';

import styled from 'styled-components';
import { Button, Icon } from 'semantic-ui-react';

/**
 * Number incrementer for adjusting integer votes
 */
const ChitTicker = props => {
	const { member, chits, updateChits } = useVoting();

	const context = Object.assign({ member, chits, updateChits }, props);

	return <ChitTickerComponent { ...context }>{props.children}</ChitTickerComponent>;
};

/**
 * Full Component containing Ticker, Org Title and amount feedback
 */
const ChitTickerComponent = props => {
	const [ value, setValue ] = useState(parseInt(props.chits[props.org._id]));
	
	const MAX = props.member.theme.chits;

	useEffect(() => {
		// Disable contextmenu for long press on mobile
		document.oncontextmenu = () => false;
	}, []);

	const handleChange = value => {
		if(value < 0 || value > MAX) return;

		// undefined value from empty DB field should be dealt with correctly
		if(_.isNaN(value)) {
			setValue(0);
			props.updateChits(props.org._id, 0);
			return;
		}

		// Constrain value to be between 0 and member's assigned chits
		let sum = 0;
		_.forEach(props.chits, (votes, key) => {
			sum += key === props.org._id ? parseInt(value) : votes;
		});
		const constrained = MAX - sum < 0 ? parseInt(value) + (MAX - sum) : parseInt(value);
		// const constrained = Math.min(Math.max(value, 0), MAX);
		setValue(constrained);

		// Save new value to DB on every change
		props.updateChits(props.org._id, constrained);
	};

	return (
		<TickerContainer>
			<TransparentButton icon='minus' onClick={ () => handleChange(value - 1) } size='huge' />
			<Amount>
				{ value }
			</Amount>
			<TransparentButton icon='plus' onClick={ () =>  handleChange(value + 1) } size='huge' />
		</TickerContainer>
	);
};

const TickerContainer = styled.div`
	width: 100%;
	height: 100%;
	margin: 0;
	position: relative;

	.input-range {
		margin-bottom: 15px;
	}
`;

const Amount = styled.div`
	font-size: 4rem;
	text-align: center;
	line-height: 1.15;
	display: inline-block;
	padding: 0 15px;
`;

const TransparentButton = styled(Button)`
	&& {
		background: none;
		color: white;
		vertical-align: bottom;
		margin-bottom: 4px;
	}
`;

ChitTickerComponent.propTypes = {
	member: PropTypes.object,
	org: PropTypes.object,
	updateChits: PropTypes.func,
	chits: PropTypes.object,
};

ChitTicker.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

export default ChitTicker;

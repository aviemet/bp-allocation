import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { useVoting } from '/imports/ui/Kiosk/VotingContext';

import styled from 'styled-components';
import { Input, Button, Icon } from 'semantic-ui-react';

/**
 * Tactile slider for adjusting voting amount
 */
const ChitTicker = props => {
	const { member, chits, updateChits } = useVoting();

	const context = Object.assign({ member, chits, updateChits }, props);

	return <ChitTickerComponent { ...context }>{props.children}</ChitTickerComponent>;
};

/**
 * Full Component containing Slider, Org Title and amount feedback
 */
const ChitTickerComponent = props => {
	const [ value, setValue ] = useState(parseInt(props.chits[props.org._id]));
	
	const MAX = props.member.theme.amount;

	useEffect(() => {
		// Disable contextmenu for long press on mobile
		document.oncontextmenu = () => false;
	}, []);

	const handleChange = value => {
		// undefined value from empty DB field should be dealt with correctly
		if(_.isNaN(value)) {
			setValue(0);
			props.updateChits(props.org._id, 0);
			return;
		}

		// Constrain value to not exceed total funds of member
		let sum = 0;
		_.forEach(props.chits, (voteAmount, key) => {
			sum += key === props.org._id ? parseInt(value) : voteAmount;
		});
		const newValue = MAX - sum < 0 ? parseInt(value) + (MAX - sum) : parseInt(value);
		setValue(newValue);

		// Save new value to DB on every change
		props.updateChits(props.org._id, newValue);
	};
		
	const adjustValue = amount => {
		// TODO: Fix hardcoded max value
		if(value + amount >= 0 && value + amount <= 3) {
			setValue(value + amount);
		}
	};

	return (
		<TickerContainer>
			<Button onClick={ () => adjustValue(-1) }>-</Button>
			<Amount>
				{ value }
			</Amount>
			<Button onClick={ () => adjustValue(1) }>+</Button>
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

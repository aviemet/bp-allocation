import React, { useState } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

import ReactCountdownClock from 'react-countdown-clock';

const Timer = ({ seconds }) => {

	const [ countdown, setCountdown ] = useState(true);

	const timerFinish = () => {
		setTimeout(() => {
			setCountdown(false);
		}, 2000);
	};

	if(!countdown) {
		return(
			<FinishedContainer>
				<h1>Thank you<br/>for voting!</h1>
			</FinishedContainer>
		);
	}

	return (
		<TimerContainer>
			<ReactCountdownClock
				seconds={ seconds + 1 }
				color="#FFF"
				size={ 850 }
				weight={ 10 }
				onComplete={ timerFinish }
				showMilliseconds={ false }
			/>
		</TimerContainer>
	);
};

const TimerContainer = styled.div`
	.react-countdown-clock {
		position: absolute;
		margin: 0 auto;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;

		& canvas:nth-child(2){
			position: relative !important;
		}
	}
`;

const FinishedContainer = styled.div`
	position: absolute;
	margin: 0 auto;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	font-family: TradeGothic;
	text-transform: uppercase;

	h1{
		color: #FFF;
		font-family: TradeGothic;
		font-size: 6em;
		text-align: center;
	}
`;

Timer.propTypes = {
	seconds: PropTypes.number
};

export default Timer;

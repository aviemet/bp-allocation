import React from 'react';
import PropTypes from 'prop-types';

import { Header } from 'semantic-ui-react';
import styled from 'styled-components';

import ReactCountdownClock from 'react-countdown-clock';

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

export default class Timer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			countdown: true
		}
	}

	timerFinish = () => {
		setTimeout(() => {
			this.setState({countdown: false});
		}, 2000);
	}

	render() {
		if(this.state.countdown){
			return (
				<TimerContainer>
					<ReactCountdownClock
						seconds={this.props.seconds}
						color="#FFF"
						size={850}
						weight={10}
						onComplete={this.timerFinish}
						showMilliseconds={false}
					/>
				</TimerContainer>
			);
		} else {
			return(
				<FinishedContainer>
					<h1>Thank you<br/>for voting!</h1>
				</FinishedContainer>
			);
		}
	}
 }

import React from "react"
import PropTypes from "prop-types"

import styled from "@emotion/styled"

import { CountdownCircleTimer } from "react-countdown-circle-timer"

const secondsAsMinutes = seconds => {
	const m = Math.floor(seconds % 3600 / 60)
	const s = Math.floor(seconds % 3600 % 60)
	return `${m}:${s < 10 ? 0 : ""}${s}`
}

const renderTime = ({ remainingTime }) => {
	if(remainingTime === 0) {
		return <h1>Thank you<br/>for voting!</h1>
	}

	return <h1>{ secondsAsMinutes(remainingTime) }</h1>
}

const Timer = ({ seconds }) => {

	return (
		<TimerContainer>
			<CountdownCircleTimer
				className="countdown-clock"
				isPlaying
				duration={ seconds }
				colors="white"
				trailColor="#AAA"
				strokeWidth={ 12 }
				strokeLinecap="square"
				size={ 500 }
				onComplete={ () => ({ shouldRepeat: false, delay: 1 }) }
			>
				{ renderTime }
			</CountdownCircleTimer>
		</TimerContainer>
	)
}

const TimerContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100%;
	padding: 16px 0 16px 0;

	.countdown-clock {
		flex: 1;

		/* & canvas:nth-child(2){
			position: relative !important;
		} */
	}

	h1{
		color: #FFF;
		font-family: TradeGothic;
		font-size: 6em;
		text-align: center;
	}
`

Timer.propTypes = {
	seconds: PropTypes.number,
}

export default Timer

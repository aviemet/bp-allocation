import { Typography } from "@mui/material"
import PropTypes from "prop-types"
import React, { useState } from "react"

import useInterval from "/imports/ui/components/useInterval"

const Countdown = ({ seconds, isCounting }) => {
	const [count, setCount] = useState(seconds)

	useInterval(() => {
		setCount(count - 1)
	}, isCounting ? 1000 : null)

	return (
		<Typography component="h4" variant="h6" className="countdown">
			Voting has ended, please submit your votes. <br/>
			This page will redirect in { count } seconds
		</Typography>
	)
}

Countdown.propTypes = {
	seconds: PropTypes.number.isRequired,
	isCounting: PropTypes.bool.isRequired,
}

export default Countdown

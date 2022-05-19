import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Typography } from '@mui/material'

import useInterval from '/imports/ui/Components/useInterval'

const Countdown = ({ seconds, isCounting }) => {
	const [ count, setCount ] = useState(seconds)

	useInterval(() => {
		setCount(count - 1)
	}, isCounting ? 1000 : null)

	return (
		<Typography component='h3' variant='h6' className='countdown'>
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
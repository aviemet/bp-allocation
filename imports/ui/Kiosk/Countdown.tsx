import React, { useState } from 'react'
import { Typography } from '@mui/material'
import { useInterval } from '/imports/lib/hooks'

interface ICountdownProps {
	seconds: number
	isCounting: boolean
}

const Countdown = ({ seconds, isCounting }: ICountdownProps) => {
	const [count, setCount] = useState(seconds)

	useInterval(() => {
		setCount(count - 1)
	}, isCounting ? 1000 : null)

	return (
		<Typography component='h4' variant='h6' className='countdown'>
			Voting has ended, please submit your votes. <br/>
			This page will redirect in { count } seconds
		</Typography>
	)
}

export default Countdown

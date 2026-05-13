import { Typography } from "@mui/material"
import { useState } from "react"

import { useInterval } from "/imports/lib/hooks/useInterval"

interface CountdownProps {
	seconds: number
	isCounting: boolean
}

export const Countdown = ({ seconds, isCounting }: CountdownProps) => {
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


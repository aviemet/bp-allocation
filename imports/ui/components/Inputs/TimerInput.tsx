import React, { useState } from "react"
import PropTypes from "prop-types"
import { TextField } from "@mui/material"
import { PresentationSettingsMethods } from "/imports/api/methods"

const TimerInput = props => {
	const [ timerLength, setTimerLength ] = useState(props.timerLength)

	const saveTimerLength = () => {
		PresentationSettingsMethods.update.call({
			id: props.settingsId,
			data: { timerLength },
		})
	}

	return (
		<TextField
			fullWidth
			type="number"
			label="Seconds"
			index="timerLength"
			value={ timerLength }
			onChange={ e => setTimerLength(parseInt(e.target.value)) }
			onBlur={ saveTimerLength }
		/>
	)

}

TimerInput.propTypes = {
	timerLength: PropTypes.number,
	settingsId: PropTypes.string,
}

export default TimerInput

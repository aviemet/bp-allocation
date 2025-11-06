import { TextField } from "@mui/material"
import { useState } from "react"
import { PresentationSettingsMethods } from "/imports/api/methods"

interface TimerInputProps {
	timerLength?: number
	settingsId: string
}

const TimerInput = ({ timerLength: initialTimerLength, settingsId }: TimerInputProps) => {
	const [ timerLength, setTimerLength ] = useState(initialTimerLength || 0)

	const saveTimerLength = async () => {
		await PresentationSettingsMethods.update.callAsync({
			id: settingsId,
			data: { timerLength },
		})
	}

	return (
		<TextField
			fullWidth
			type="number"
			label="Seconds"
			value={ timerLength }
			slotProps={ {
				htmlInput: {
					inputMode: "numeric",
					pattern: "[0-9]*",
				},
			} }
			onChange={ e => setTimerLength(parseInt(e.target.value) || 0) }
			onBlur={ saveTimerLength }
		/>
	)
}

export default TimerInput

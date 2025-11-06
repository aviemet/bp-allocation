import { TextField } from "@mui/material"
import { useState } from "react"
import { PresentationSettingsMethods } from "/imports/api/methods"

interface ResultsOffsetInputProps {
	resultsOffset?: number
	settingsId: string
}

const ResultsOffsetInput = ({ resultsOffset: initialResultsOffset, settingsId }: ResultsOffsetInputProps) => {
	const [ resultsOffset, setResultsOffset ] = useState<number | undefined>(initialResultsOffset)

	const saveResultsOffset = async () => {
		await PresentationSettingsMethods.update.callAsync({
			id: settingsId,
			data: { resultsOffset },
		})
	}

	return (
		<TextField
			fullWidth
			type="number"
			label="Results Offset Amount"
			value={ resultsOffset ?? "" }
			slotProps={ {
				htmlInput: {
					inputMode: "numeric",
					pattern: "[0-9]*",
				},
			} }
			onChange={ e => {
				const value = parseFloat(e.target.value)
				setResultsOffset(isNaN(value) ? undefined : value)
			} }
			onBlur={ saveResultsOffset }
		/>
	)
}

export default ResultsOffsetInput

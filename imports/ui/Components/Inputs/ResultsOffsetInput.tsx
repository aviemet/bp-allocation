import React, { useState } from 'react'
import { TextField } from '@mui/material'
import { PresentationSettingsMethods } from '/imports/api/methods'

interface IResultsOffsetInputProps {
	resultsOffset?: number
	settingsId: string
}

const ResultsOffsetInput = (props: IResultsOffsetInputProps) => {
	const [ resultsOffset, setResultsOffset ] = useState(props.resultsOffset)

	const saveResultsOffset = () => {
		PresentationSettingsMethods.update.call({
			id: props.settingsId,
			data: { resultsOffset },
		})
	}

	return (
		<TextField
			fullWidth
			type='text'
			inputProps={ { pattern: '[0-9]*' } }
			label='Results Offset Amount'
			value={ resultsOffset || '' }
			onChange={ e => setResultsOffset(parseFloat(e.target.value)) }
			onBlur={ saveResultsOffset }
		/>
	)

}

export default ResultsOffsetInput

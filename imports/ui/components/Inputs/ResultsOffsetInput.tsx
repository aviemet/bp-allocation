import { useState } from "react"
import PropTypes from "prop-types"
import { TextField } from "@mui/material"
import { PresentationSettingsMethods } from "/imports/api/methods"

const ResultsOffsetInput = props => {
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
			type="text"
			pattern="[0-9]*"
			label="Results Offset Amount"
			index="resultsOffset"
			value={ resultsOffset || "" }
			onChange={ e => setResultsOffset(parseFloat(e.target.value)) }
			onBlur={ saveResultsOffset }
		/>
	)

}

ResultsOffsetInput.propTypes = {
	resultsOffset: PropTypes.number,
	settingsId: PropTypes.string,
}

export default ResultsOffsetInput

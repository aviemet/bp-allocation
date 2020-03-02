import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';
import { PresentationSettingsMethods } from '/imports/api/methods';

const ResultsOffsetInput = props => {
	const [ resultsOffset, setResultsOffset ] = useState(props.resultsOffset);

	const saveResultsOffset = () => {
		PresentationSettingsMethods.update.call({
			id: props.settingsId,
			data: { resultsOffset }
		});
	};

	return (
		<Input
			type='text'
			pattern="[0-9]*"
			icon='dollar sign'
			iconPosition='left'
			label='Offset'
			labelPosition='right'
			index='resultsOffset'
			value={ resultsOffset }
			onChange={ e => setResultsOffset(parseFloat(e.target.value)) }
			onBlur={ saveResultsOffset }
		/>
	);

};

ResultsOffsetInput.propTypes = {
	resultsOffset: PropTypes.number,
	settingsId: PropTypes.string
};

export default ResultsOffsetInput;
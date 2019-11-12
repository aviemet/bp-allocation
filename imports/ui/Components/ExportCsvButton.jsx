import React from 'react';
import PropTypes from 'prop-types';
import Papa from 'papaparse';

import { Button } from 'semantic-ui-react';

const ExportCsvButton = props => {

	const exportData = () => {
		const settings = props.settings || {};

		if(props.data) {
			// Convert data to CSV format
			let csv = Papa.unparse(props.data, settings);

			// Prep the file information
			let csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
			
			const filename = props.description || 'Allocation Export';
			if (navigator.msSaveBlob) { // IE 10+
				navigator.msSaveBlob(csvData, filename);
			} else {
				let link = document.createElement('a');
				if (link.download !== undefined) { // feature detection
					// Browsers that support HTML5 download attribute
					let url = URL.createObjectURL(csvData);
					link.setAttribute('href', url);
					link.setAttribute('download', filename);
					link.style.visibility = 'hidden';
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
				}
			}
		}
	};

	return (
		<Button onClick={ exportData }>Export {props.description}</Button>
	);
};

ExportCsvButton.propTypes = {
	settings: PropTypes.object,
	data: PropTypes.array,
	description: PropTypes.string
};

export default ExportCsvButton;

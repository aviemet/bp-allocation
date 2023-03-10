import React from 'react'
import PropTypes from 'prop-types'
import Papa from 'papaparse'

import Button from '@mui/material/Button'

const ExportCsvButton = ({ options, data, description }) => {

	const exportData = () => {
		if(data) {
			// Convert data to CSV format
			let csv = Papa.unparse(data, options)

			// Prep the file information
			let csvData = new Blob([csv], { type: 'text/csvcharset=utf-8' })

			const filename = `${description || 'Allocation Export'}.csv`
			if (navigator.msSaveBlob) { // IE 10+
				navigator.msSaveBlob(csvData, filename)
			} else {
				let link = document.createElement('a')
				if (link.download !== undefined) { // feature detection
					// Browsers that support HTML5 download attribute
					let url = URL.createObjectURL(csvData)
					link.setAttribute('href', url)
					link.setAttribute('download', filename)
					link.style.visibility = 'hidden'
					document.body.appendChild(link)
					link.click()
					document.body.removeChild(link)
				}
			}
		}
	}

	return (
		<Button onClick={ exportData }>Export {description}</Button>
	)
}

ExportCsvButton.propTypes = {
	options: PropTypes.object,
	data: PropTypes.array,
	description: PropTypes.string
}

ExportCsvButton.defaultProps = {
	options: {},
}

export default ExportCsvButton

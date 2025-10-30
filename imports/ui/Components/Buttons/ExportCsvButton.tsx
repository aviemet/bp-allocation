import Button from "@mui/material/Button"
import Papa from "papaparse"
import React from "react"

interface ExportCsvButtonProps {
	options?: Papa.UnparseConfig
	data?: Record<string, unknown>[]
	description: string
}

const ExportCsvButton = ({ options = {}, data, description }: ExportCsvButtonProps) => {

	const exportData = () => {
		if(data) {
			// Convert data to CSV format
			let csv = Papa.unparse(data, options)

			// Prep the file information
			let csvData = new Blob([csv], { type: "text/csvcharset=utf-8" })

			const filename = `${description || "Allocation Export"}.csv`

			let link = document.createElement("a")
			if(link.download !== undefined) { // feature detection
				// Browsers that support HTML5 download attribute
				let url = URL.createObjectURL(csvData)
				link.setAttribute("href", url)
				link.setAttribute("download", filename)
				link.style.visibility = "hidden"
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
			}

		}
	}

	return (
		<Button onClick={ exportData }>Export { description }</Button>
	)
}

export default ExportCsvButton

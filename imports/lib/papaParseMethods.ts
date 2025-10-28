import Papa, {} from "papaparse"
import { isUndefined, indexOf, isEmpty, forEach, has } from "lodash"

/**************************************
 *          PAPAPARSE METHODS         *
 **************************************/

interface AcceptedHeading {
	name: string
	type?: (value: unknown) => unknown
	forms: string[]
}

interface HeadingMapping {
	[key: string]: {
		name: string
		type?: (value: unknown) => unknown
	}
}

interface Callbacks {
	beforeInferHeadings?: (headings: string[]) => void
	afterInferHeadings?: (headingsMap: HeadingMapping) => void
	beforeRowParse?: (rowData: Record<string, unknown>) => void
	afterRowParse?: (row: Record<string, unknown>) => void
	onComplete?: (data: Record<string, unknown>[], headers?: string[]) => void
}

/**
 * Runs callback if defined, returning data as appropriate
 */
function _dispatchCallback<T extends unknown[]>(cb: ((...args: T) => unknown) | undefined, ...args: T): T {
	if(!isUndefined(cb)) {
		const response = cb(...args)
		if(!isUndefined(response)) return response as T
	}
	return args
}

/**
 * Takes a row from a csv file, maps headings in file to key values in final return object
 */
const _inferHeadings = (headings: string[], acceptedHeadings: AcceptedHeading[], callbacks: Callbacks): HeadingMapping => {
	let headingsMap: HeadingMapping = {}

	_dispatchCallback(callbacks.beforeInferHeadings, headings)
	// Search array of headings for matches to map
	headings.map(heading => {
		const matchKey = heading.trim().toLowerCase() // Normalize keys for comparisons

		// Check for matches in the acceptedHeadings object
		let matched = false
		for(let i = 0; !matched && i < acceptedHeadings.length; i++) {
			const formsIndex = indexOf(acceptedHeadings[i].forms, matchKey)

			if(formsIndex >= 0) {
				matched = true
				// headingsMap: { "CSV Heading": "mappedHeading" }
				headingsMap[heading] = {
					name: acceptedHeadings[i].name,
					type: acceptedHeadings[i].type,
				}
			}
		}
	})

	_dispatchCallback(callbacks.afterInferHeadings, headingsMap)

	return headingsMap
}

/**
 * Reads a csv file, mapping headings in the file to given key values.
 * Use to convert heading values in a file to useable key values for submitting to a database.
 */
export const readCsvWithHeadings = (file: File, acceptedHeadings: AcceptedHeading[], callbacks: Callbacks = {}): void => {
	// Object for headings mapping
	let headings: HeadingMapping = {}

	let data: Record<string, unknown>[] = []
	const parser = Papa.parse(file, {
		header: true,
		delimiter: ",",
		dynamicTyping: true,
		skipEmptyLines: true,
		step: (results) => {
			// Look at the first row to infer heading mapping
			if(isEmpty(headings)) {
				headings = _inferHeadings(results.meta.fields || [], acceptedHeadings, callbacks)
			}

			let row: Record<string, unknown> = {} // Return object

			let rowData = (results.data as Record<string, unknown>[])[0]
			_dispatchCallback(callbacks.beforeRowParse, rowData)

			// Touch each value in the row
			forEach(rowData, (value, key) => {
				// Grab data with an accepted heading
				if(has(headings, key)) {
					const headingConfig = headings[key]
					row[headingConfig.name] = typeof headingConfig.type === "function" ? headingConfig.type(value) : value
				}
			})

			_dispatchCallback(callbacks.afterRowParse, row)

			data.push(row)
		},
		complete: () => {
			_dispatchCallback(callbacks.onComplete, data)
		},
	})

	return parser
}

/**
 * Reads a csv file, returns an array of rows in key,value object form
 */
export const readCsv = (file: File, callbacks: Callbacks = {}): void => {
	let firstRun = true
	let headers: string[] = []
	let data: Record<string, unknown>[] = []

	const parser = Papa.parse(file, {
		header: true,
		delimiter: ",",
		dynamicTyping: true,
		skipEmptyLines: true,
		step: (results) => {
			if(firstRun) {
				headers = (results.meta.fields || []).filter(field => field !== "")
				firstRun = false
			}
			let row: Record<string, unknown> = {} // Return object

			let rowData = results.data as Record<string, unknown>
			_dispatchCallback(callbacks.beforeRowParse, rowData)

			// Touch each value in the row
			forEach(rowData, (value, key) => row[key] = value)

			_dispatchCallback(callbacks.afterRowParse, row)

			data.push(row)
		},
		complete: () => {
			_dispatchCallback(callbacks.onComplete, data, headers)
		},
	})

	return parser
}

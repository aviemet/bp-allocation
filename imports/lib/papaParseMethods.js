import Papa from 'papaparse'
import { isUndefined, indexOf, isEmpty, forEach, has } from 'lodash'

/**************************************
 *          PAPAPARSE METHODS         *
 **************************************/

/**
 * Runs callback if defined, returning data as appropriate
 * @param  {Object}   data Data to be passed to method
 * @param  {Function} cb   Callback to be called
 * @return {Object}        Data response object
 */
const _dispatchCallback = (cb, data) => {
	if(!isUndefined(cb)) {
		const response = cb(data)
		if(!isUndefined(response)) return response
	}
	return data
}

/**
 * Takes a row from a csv file, maps headings in file to key values in final return object
 * @param  {Object} row              JSON row object
 * @param  {Object} acceptedHeadings JSON object with mapping instructions
 * @param  {Object} callbacks        Lifecycle callbacks
 * @return {Object}                  JSON object of headings mapping
 */
const _inferHeadings = (headings, acceptedHeadings, callbacks) => {
	let headingsMap = {}

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
					type: acceptedHeadings[i].type
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
 * @param  {File} file             File object from input
 * @param  {Object} acceptedHeadings JSON object with 'name' and 'forms' fields. 'forms' is an array of potential headings in the file which should be mapped/converted to 'name' in the final return object after parsing.
 * @param  {Object} callbacks        Lifecycle callbacks. Accepted values are:
 *                                     'beforeInferHeadings(row)',
 *                                     'afterInferHeadings(headings)',
 *                                     'beforeRowParse(row)',
 *                                     'afterRowParse(row)',
 *                                     'onComplete(data)'
 * @return {Object}                  [description]
 */
export const readCsvWithHeadings = (file, acceptedHeadings, callbacks) => {
	// Object for headings mapping
	let headings = {}

	let data = []
	const parser = Papa.parse(file, {
		header: true,
		delimiter: ',',
		dynamicTyping: true,
		skipEmptyLines: true,
		step: (results, parser) => {
			// Look at the first row to infer heading mapping
			if(isEmpty(headings)) {
				headings = _inferHeadings(results.meta.fields, acceptedHeadings, callbacks)
			}

			let row = {} // Return object

			let rowData = results.data[0]
			_dispatchCallback(callbacks.beforeRowParse, rowData)

			// Touch each value in the row
			forEach(rowData, (value, key) => {
				// Grab data with an accepted heading
				if(has(headings, key)) {
					row[headings[key].name] = typeof headings[key].type === 'function' ? headings[key].type(value) : value
				}
			})

			_dispatchCallback(callbacks.afterRowParse, row)

			data.push(row)
		},
		complete: results => {
			_dispatchCallback(callbacks.onComplete, data)
		}
	})

	return parser
}

import React, { useRef, useEffect } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

export const roundFloat = (value, decimal) => {
	decimal = decimal || 2;
	return parseFloat(parseFloat(value).toFixed(decimal));
};

/*export const getSaveAmount = (saves, org_id) => {
	let save = saves.find( save => save.org === org_id);
	return save ? save.amount : 0;
};*/

export const numberFormats = {
	dollar: '$0,0[a]',
	percent: '0.0%'
};

export function isMobileDevice() {
	return (typeof window.orientation !== 'undefined') || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

export const paginate = (collection, page, itemsPerPage) => collection.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

// Ensures names are in the format 'First Last'
// Breaks apart names given as 'Last, First' and returns them as 'First Last'
export const sanitizeNames = name => {
	const split = name.split(',');
	const newName = [];
	for(let i = 1; i < split.length; i++) {
		newName.push(split[i].trim());
	}
	newName.push(split[0]);
	return newName.join(' ');
};

/**************************************
 *      Queue class for Pledges       *
 **************************************/
export class Queue {
	constructor() {
		this.queue = [];
	}

	enqueue(element) {
		this.queue.push(element);
	}

	dequeue() {
		if (this.isEmpty()) return 'Queue is empty';
		return this.queue.shift();
	}

	isEmpty() {
		return !this.queue.length;
	}
}

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
	if(!_.isUndefined(cb)) {
		const response = cb(data);
		if(!_.isUndefined(response)) return response;
	}
	return data;
};

/**
 * Takes a row from a csv file, maps headings in file to key values in final return object
 * @param  {Object} row              JSON row object
 * @param  {Object} acceptedHeadings JSON object with mapping instructions
 * @param  {Object} callbacks        Lifecycle callbacks
 * @return {Object}                  JSON object of headings mapping
 */
const _inferHeadings = (headings, acceptedHeadings, callbacks) => {
	let headingsMap = {};

	_dispatchCallback(callbacks.beforeInferHeadings, headings);

	// Search array of headings for matches to map
	headings.map(heading => {
		const matchKey = heading.trim().toLowerCase(); // Normalize keys for comparisons

		// Check for matches in the acceptedHeadings object
		let matched = false;
		for(let i = 0; !matched && i < acceptedHeadings.length; i++) {
			const formsIndex = _.indexOf(acceptedHeadings[i].forms, matchKey);

			if(formsIndex >= 0) {
				matched = true;
				// headingsMap: { "CSV Heading": "mappedHeading" }
				headingsMap[heading] = {
					name: acceptedHeadings[i].name,
					type: acceptedHeadings[i].type
				};
			}
		}
	});

	_dispatchCallback(callbacks.afterInferHeadings, headingsMap);

	return headingsMap;
};

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
	let headings = {};

	let data = [];
	const parser = Papa.parse(file, {
		header: true,
		dynamicTyping: true,
		skipEmptyLines: true,
		step: (results, parser) => {
			// Look at the first row to infer heading mapping
			if(_.isEmpty(headings)) {
				headings = _inferHeadings(results.meta.fields, acceptedHeadings, callbacks);
			}

			let row = {}; // Return object

			let rowData = results.data[0];
			_dispatchCallback(callbacks.beforeRowParse, rowData);

			// Touch each value in the row
			_.forEach(rowData, (value, key) => {
				// Grab data with an accepted heading
				if(_.has(headings, key)) {
					row[headings[key].name] = typeof headings[key].type === 'function' ? headings[key].type(value) : value;
				}
			});

			_dispatchCallback(callbacks.afterRowParse, row);

			data.push(row);
		},
		complete: results => {
			_dispatchCallback(callbacks.onComplete, data);
		}
	});

	return parser;
};

/*****************
 * DEBUG METHODS *
 *****************/

/**
* Hook to console.log prop changes in a useEffect block
* @param {Object} props Props
*/
export function useTraceUpdate(props) {
	const prev = useRef(props);
	useEffect(() => {
		const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
			if (prev.current[k] !== v) {
				ps[k] = [prev.current[k], v];
			}
			return ps;
		}, {});
		if (Object.keys(changedProps).length > 0) {
			console.log('Changed props:', changedProps);
		}
		prev.current = props;
	});
}
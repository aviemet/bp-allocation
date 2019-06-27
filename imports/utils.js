import Meteor from 'meteor/meteor';
import { useRef, useEffect } from 'react';
import Papa from 'papaparse';
import _ from 'lodash';

const KIOSK_PAGES = { info: 'info', chit: 'chit', funds: 'funds' };

const roundFloat = (value, decimal) => {
	decimal = decimal || 2;
	return parseFloat(parseFloat(value).toFixed(decimal));
};

const getSaveAmount = (saves, org_id) => {
	let save = saves.find( save => save.org === org_id);
	return save ? save.amount : 0;
};

/**************************************
 *         ORGANIZATION METHODS       *
 **************************************/

/**
 * Return all orgs sorted by votes
 */
const sortTopOrgs = (theme, orgs) => {
	if(!theme){
		throw new Meteor.Error('No theme provided to ThemeMethods.filterTopOrgs');
	}

	// Save manual top orgs as key/value true/false pairs for reference
	let manualTopOrgs = {};
	theme.topOrgsManual.map((org) => {
		manualTopOrgs[org] = true;
	});

	// First sort orgs by weight and vote count
	let sortedOrgs = _.sortBy(orgs, (org) => {
		// Calculate the votes for each org (weight/chitWeight unless there's a manual count)
		let votes = 0;
		if(org.chitVotes) {
			if(org.chitVotes.count) {
				votes = org.chitVotes.count;	
			} else if(org.chitVotes.weight) {
				votes = org.chitVotes.weight;
			}
		}

		// Save the votes count for later
		org.votes = votes;

		// Sort in descending order
		return -(votes);
	});

	//Then bubble up the manual top orgs
	// No need to proceed if manual orgs is >= numTopOrgs
	if(theme.numTopOrgs >= theme.topOrgsManual.length){
		// climb up the bottom of the list looking for manually selected orgs
		for(let i = sortedOrgs.length-1; i >= theme.numTopOrgs; i--){

			// Check if the org has been manually selected
			if(manualTopOrgs[sortedOrgs[i]._id]){
				// Find the closest automatically selected top org
				let j = i-1;
				while(j > 0 && manualTopOrgs[sortedOrgs[j]._id]){
					j--;
				}

				// Start swapping the auto top org down the list
				while(j < i){
					let tmp = sortedOrgs[i];
					sortedOrgs[i] = sortedOrgs[j];
					sortedOrgs[j] = tmp;

					j++;
				}

				// Send the index back one in case we swapped another match into previous place
				i++;
			}
		}
	}

	return sortedOrgs;
};

/**
 * Get Top Orgs Sorted by chit votes
 */
const filterTopOrgs = (theme, orgs) => {
	const slice = theme.numTopOrgs >= theme.topOrgsManual.length ? theme.numTopOrgs : theme.topOrgsManual.length;

	let sortedOrgs = sortTopOrgs(theme, orgs);

	return sortedOrgs.slice(0, slice);
};


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
 * @param  {Object} callbacks        Lifecycle callbacks. Accepted valuse are:
 *                                     'beforeInferHeadings(row)',
 *                                     'afterInferHeadings(headings)',
 *                                     'beforeRowParse(row)',
 *                                     'afterRowParse(row)',
 *                                     'onComplete(data)'
 * @return {Object}                  [description]
 */
const readCsvWithHeadings = (file, acceptedHeadings, callbacks) => {
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

function useTraceUpdate(props) {
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

export {
	KIOSK_PAGES,
	roundFloat,
	getSaveAmount,
	sortTopOrgs,
	filterTopOrgs,
	readCsvWithHeadings,
	useTraceUpdate
};

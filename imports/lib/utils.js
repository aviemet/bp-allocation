import React, { useRef, useEffect } from 'react';
import _ from 'lodash';

export const roundFloat = (value, decimal) => {
	decimal = decimal || 2;
	return parseFloat(parseFloat(value).toFixed(decimal));
};

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

// Format phone numbers as international numbers
// Assume any number lacking a '+' at beginning is a US number (add +1 to start)
export const formatPhoneNumber = number => {
	let newPhone = number.replace(/[^0-9+]/g, ''); // Reduce number down to numbers and the + symbol

	if(!_.isEmpty(newPhone) && !/^\+/.test(newPhone)) { // Doesn't start with +
		newPhone = '+1' + newPhone.replace(/^1/, ''); // US area codes don't start with 0 or 1
	}
	return newPhone;
};

export const sanitizeString = str => {
	if(typeof str === 'string') {
		return str.trim();
	}
	return str;
};

/**
 * Returns a subset of passed collection filtered by searh terms
 * @param {array} collection Array of objects to be filtered
 * @param {string} search Search parameter(s) to filter by
 * @param {array} fields Optional list of fields to search (omitting others)
 */
// TODO: Should only search each field once ('avr avram') should not match firstName twice
export const filterCollection = (collection, search, fields) => {
	if(!search) return collection;

	// Split search terms by whitespace, discarding empty strings
	const searchParts = search.split(/\s+/).filter(part => part.length > 0);
	const checkFields = fields || Object.keys(collection[0]);

	return collection.filter(member => {
		return searchParts.every(word => {
			const test = new RegExp(word, 'i');
			return checkFields.some(field => {
				if(test.test(member[field])) {
					return true;
				}
			});
		});
	});
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
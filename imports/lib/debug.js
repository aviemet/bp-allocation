import React, { useRef, useEffect } from 'react';

/*****************
 * DEBUG METHODS *
 *****************/

/**
* Hook to console.log prop changes in a useEffect block
* @param {Object} props Props
*/
export const useTraceUpdate = props => {
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
};
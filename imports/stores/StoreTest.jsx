import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from './AppContext';

export const StoreTest = props => {

	const [ count, setCount ] = useState(0);

	const theme = useTheme();

	console.log({ theme });

	return (
		<>
			<h1>Testing the Store</h1>
			<h2>{count}</h2>
			<button onClick={ () => setCount(count + 1) }>Click Me</button>
		</>
	);
};

StoreTest.propTypes = {
	theme: PropTypes.object,
	loading: PropTypes.bool
};

export default StoreTest;
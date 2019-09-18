import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import DataStore from './DataStore';
import { observer } from 'mobx-react-lite';

export const DataContext = React.createContext();
export const useData = () => useContext(DataContext);

const dataStore = new DataStore();

const DataProvider = props => {
	console.log('data render');

	return (
		<DataContext.Provider value={ dataStore }>
			{ props.children }
		</DataContext.Provider>
	);
};

DataProvider.propTypes = {
	children: PropTypes.any
};

export default DataProvider;
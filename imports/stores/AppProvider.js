import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import AppStore from './AppStore';

export const AppContext = React.createContext();
export const useApp = () => useContext(AppContext);

const appStore = new AppStore();

const AppProvider = props => {
	console.log('provider render');

	return (
		<AppContext.Provider value={ appStore }>
			{ props.children }
		</AppContext.Provider>
	);
};

AppProvider.propTypes = {
	children: PropTypes.any
};

export default AppProvider;
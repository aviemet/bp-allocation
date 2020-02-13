import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';

import { useTracker } from 'meteor/react-meteor-data';
import { useAppData } from '/imports/api/stores/lib/AppDataProvider';
import { Themes } from '/imports/api/db';

const ThemeContext = React.createContext('theme');
export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = observer(props => {
	const appData = useAppData();
	const themeId = appData.themeId;

	const { theme } = useTracker(() => {
		if(!themeId) return {
			isLoading: false,
			theme: undefined
		};

		const subscription = Meteor.subscribe('theme', themeId);
		const theme = Themes.findOne({ _id: themeId });
		
		return {
			theme,
			isLoading: !subscription.ready()
		};

	}, [themeId]);

	return (
		<ThemeContext.Provider value={ theme }>
			{ props.children }
		</ThemeContext.Provider>
	);

});

ThemeProvider.propTypes = {
	children: PropTypes.any
};

export default ThemeProvider;
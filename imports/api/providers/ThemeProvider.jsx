import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';

import { useTracker } from 'meteor/react-meteor-data';
import { useData } from './DataProvider';
import { Themes } from '/imports/api/db';
import { ThemeStore } from '/imports/api/stores';

// Create the context and context hook
const ThemeContext = React.createContext('theme');
export const useTheme = () => useContext(ThemeContext);

const ThemeProvider = observer(props => {
	const data = useData();
	let subscription;
	// let observer;

	const theme = useTracker(() => {
		if(!data.themeId) {
			return {
				isLoading: true,
				theme: undefined
			};
		} 

		let themeStore;
		subscription = Meteor.subscribe('theme', data.themeId, {
			onReady: () => {
				const results = Themes.findOne({ _id: data.themeId });
				themeStore = results ? new ThemeStore(results) : undefined;

				// observer = themeCursor.observe({
				// 	added: theme => this.theme.refreshData(theme),
				// 	changed: theme => this.theme.refreshData(theme)
				// });
			}
		});

		return {
			theme: themeStore,
			isLoading: !subscription.ready()
		};

	}, [data.themeId]);

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
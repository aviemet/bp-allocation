import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';

import { useTracker } from 'meteor/react-meteor-data';
import { useData } from './DataProvider';
import { useTheme } from './ThemeProvider';
import { PresentationSettings } from '/imports/api/db';
import { SettingsStore } from '/imports/api/stores';
import { toJS } from 'mobx';

const SettingsContext = React.createContext('settings');
export const useSettings = () => useContext(SettingsContext);

const SettingsProvider = observer(props => {
	const data = useData();
	const { theme, isLoading: themeLoading } = useTheme();
	let subscription;
	// let observer;

	const settings = useTracker(() => {
		if(!data.themeId) return {
			isLoading: true,
			settings: undefined
		};

		let settings = {};
		subscription = Meteor.subscribe('settings', data.themeId, {
			onReady: () => {
				if(!themeLoading) {
					const result = PresentationSettings.findOne({ _id: theme.presentationSettings });
					// const result = cursor.fetch()[0];
					settings = new SettingsStore(result);

					// cursor.observe({
					// 	added: settings => settings.refreshData(result),
					// 	changed: settings => settings.refreshData(result)
					// });
				}
			}
		});
		
		return {
			settings,
			isLoading: !subscription.ready()
		};

	}, [data.themeId]);

	return (
		<SettingsContext.Provider value={ settings }>
			{ props.children }
		</SettingsContext.Provider>
	);

});

SettingsProvider.propTypes = {
	children: PropTypes.any
};

export default SettingsProvider;
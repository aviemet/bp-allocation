import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react-lite';

import { useTracker } from 'meteor/react-meteor-data';
import { useData } from './DataProvider';
import { Organizations } from '/imports/api/db';
import { OrgsCollection, OrgStore } from '/imports/api/stores';
import { filterTopOrgs } from '/imports/lib/orgsMethods';
import { useTheme } from './ThemeProvider';

const OrgsContext = React.createContext('orgs');
export const useOrgs = () => useContext(OrgsContext);

const OrgsProvider = observer(function(props) {
	const { themeId } = useData();
	const { theme, isLoading: themeLoading } = useTheme();
	let subscription;
	let observer;
	let orgsCollection; // The MobX store for the settings

	const orgs = useTracker(() => {
		if(!themeId) {
			if(subscription) subscription.stop();
			if(observer) observer.stop();

			return {
				isLoading: true,
				settings: undefined
			};
		}
		
		subscription = Meteor.subscribe('organizations', themeId, {
			onReady: () => {
				const cursor = Organizations.find({ theme: themeId });
				orgsCollection = new OrgsCollection(cursor.fetch(), theme, OrgStore);
				
				cursor.observe({
					added: orgs => orgsCollection.refreshData(orgs),
					changed: orgs => orgsCollection.refreshData(orgs),
					removed: orgs => orgsCollection.deleteItem(orgs)
				});
			}
		});

		return {
			orgs: orgsCollection,
			topOrgs: themeLoading ? [] : filterTopOrgs(orgsCollection.values, theme),
			isLoading: !subscription.ready()
		};

	}, [themeId]);

	return (
		<OrgsContext.Provider value={ orgs }>
			{ props.children }
		</OrgsContext.Provider>
	);

});

OrgsProvider.propTypes = {
	children: PropTypes.any
};

export default OrgsProvider;
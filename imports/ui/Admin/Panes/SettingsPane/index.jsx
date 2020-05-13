import React from 'react';
import { Tab } from 'semantic-ui-react';

import ThemeSettings from './ThemeSettings';
import MessageSettings from './MessageSettings';

const panes = [
	{ menuItem: 'Theme Settings', render: () => <Tab.Pane><ThemeSettings /></Tab.Pane> },
	{ menuItem: 'Messages', render: () => <Tab.Pane><MessageSettings /></Tab.Pane> }
];

const SettingsPane = () => {
	return (
		<Tab 
			panes={ panes } 
		/>
	);
};

export default SettingsPane;



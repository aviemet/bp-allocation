import React, { useState } from 'react';
import { Container, Menu, Segment } from 'semantic-ui-react';
import { Route, Switch, useLocation } from 'react-router-dom';

import ThemeSettings from './ThemeSettings';
import MessageSettings from './MessageSettings';

const TABS_ORDER = ['theme', 'messages'];
const TABS = {
	theme:{
		slug: 'theme',
		heading: 'Theme Settings',
		color: 'green',
		component: ThemeSettings
	},
	messages: {
		slug: 'messages',
		heading: 'Messages',
		color: 'violet',
		component: MessageSettings
	},
};

const SettingsPane = () => {
	const { hash } = useLocation();

	const [ activeTab, setActiveTab ] = useState(hash.replace(/#/, '') || TABS.theme.slug);

	const handleItemClick = (e, { slug }) => {
		location.hash = slug;
		setActiveTab(slug);
	};

	return (
		<Container>
			<Menu attached='top' tabular>

				{TABS_ORDER.map(tab => (
					<Menu.Item key={ tab }
						name={ TABS[tab].heading }
						slug={ TABS[tab].slug }
						active={ activeTab === TABS[tab].slug }
						onClick={ handleItemClick }
						color={ TABS[tab].color }
					/>
				))}

			</Menu>

			<Segment attached="bottom">
				<Switch location={ { pathname: activeTab } }>
					{ TABS_ORDER.map(tab => {
						const Component = TABS[tab].component;
						return(
							<Route exact path={ TABS[tab].slug } key={ tab } >
								<Component />
							</Route>
						);
					}) }
				</Switch>
			</Segment>
		</Container>
	);
};

export default SettingsPane;



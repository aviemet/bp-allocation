import { Meteor } from 'meteor/meteor';
import React, { useState, useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Route, Switch } from 'react-router-dom';

import { Themes } from '/imports/api';

import { ThemeContext, PresentationSettingsContext, OrganizationContext } from '/imports/context';

import { Loader, Grid, Header, Menu, Segment } from 'semantic-ui-react'
import styled from 'styled-components';

import { SettingsPane, OrganizationsPane, ChitVotingPane, AllocationPane, LeveragePane, PresentationPane } from '/imports/ui/Admin/Panes';

const Title = styled(Header)`
	&& {
		color: #FFF;
	}
`;

const TabMenu = styled(Menu)`
	&&& {
		a.item{
			color: #FFF;
		}
	}
`;

const TABS_ORDER = ['settings', 'orgs', 'chits', 'money', 'leverage', 'presentation'];
const TABS = {
	orgs:{
		slug: 'orgs',
		heading: 'Organizations',
		color: 'green'
	},
	chits: {
		slug: 'chits',
		heading: 'Chit Voting',
		color: 'brown'
	},
	money: {
		slug: 'money',
		heading: 'Allocation',
		color: 'orange'
	},
	settings: {
		slug: 'settings',
		heading: 'Theme Settings',
		color: 'blue'
	},
	presentation: {
		slug: 'presentation',
		heading: 'Presentation',
		color: 'pink',
		position: 'right'
	},
	leverage: {
		slug: 'leverage',
		heading: 'Leverage',
		color: 'violet'
	}
};

// Main class for the Theme page
const Admin = props => {

	const { theme, themeLoading } = useContext(ThemeContext);
	const { settingsLoading }     = useContext(PresentationSettingsContext);
	const { orgsLoading }         = useContext(OrganizationContext);

	const [ activeTab, setActiveTab ] = useState(location.hash.replace(/#/, '') || TABS.settings.slug)

	const handleItemClick = (e, {slug}) => {
		location.hash = slug;
		setActiveTab(slug);
	}

	const loading = (themeLoading || settingsLoading || orgsLoading);

	if(loading) {
		return <Loader />
	}

	return (
		<React.Fragment>

			<Grid.Row>
				<Title as='h1'>Allocation Night for {theme.title}</Title>
			</Grid.Row>

			<Grid.Row>
				<TabMenu attached='top' tabular>

					{TABS_ORDER.map((tab) => (
						<Menu.Item key={tab}
							name={TABS[tab].heading}
							slug={TABS[tab].slug}
							active={activeTab === TABS[tab].slug}
							onClick={handleItemClick}
							color={TABS[tab].color}
						/>
					))}

				</TabMenu>

				<Segment attached="bottom">
					<Switch location={{pathname: activeTab}}>

						{/* Theme Settings */}
						<Route exact path={TABS.settings.slug} >
							<SettingsPane />
						</Route>

						{/* Organizations */}
						<Route exact path={TABS.orgs.slug} >
							<OrganizationsPane />
						</Route>

						{/* Chit Voting */}
						<Route exact path={TABS.chits.slug} >
							<ChitVotingPane />
						</Route>

						{/* Allocation Voting */}
						<Route exact path={TABS.money.slug} >
							<AllocationPane />
						</Route>

						{/* Remaining Leverage Distribution */}
						<Route exact path={TABS.leverage.slug} >
							<LeveragePane />
						</Route>

						{/* Presentation Controls */}
						<Route exact path={TABS.presentation.slug} >
							<PresentationPane />
						</Route>

					</Switch>
				</Segment>

			</Grid.Row>

		</React.Fragment>
	);
}

export default Admin;


							// position={TABS[tab].position ? TABS[tab].position : false}

import { Meteor } from 'meteor/meteor';
import React, { useState, useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Route, Switch } from 'react-router-dom';

import { Themes } from '/imports/api';

import { ThemeContext, PresentationSettingsContext, OrganizationContext } from '/imports/context';

import { Loader, Grid, Header, Menu, Segment } from 'semantic-ui-react'
import styled from 'styled-components';

import { SettingsPane, MembersPane, OrganizationsPane, ChitVotingPane, AllocationPane, LeveragePane, PresentationPane } from '/imports/ui/Admin/Panes';

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

const TABS_ORDER = ['settings', 'orgs', 'members', 'chits', 'money', 'leverage', 'presentation'];
const TABS = {
	orgs:{
		slug: 'orgs',
		heading: 'Organizations',
		color: 'green',
		component: OrganizationsPane
	},
	chits: {
		slug: 'chits',
		heading: 'Chit Voting',
		color: 'brown',
		component: ChitVotingPane
	},
	money: {
		slug: 'money',
		heading: 'Allocation',
		color: 'orange',
		component: AllocationPane
	},
	settings: {
		slug: 'settings',
		heading: 'Theme Settings',
		color: 'blue',
		component: SettingsPane
	},
	presentation: {
		slug: 'presentation',
		heading: 'Presentation',
		color: 'pink',
		position: 'right',
		component: PresentationPane
	},
	leverage: {
		slug: 'leverage',
		heading: 'Leverage',
		color: 'violet',
		component: LeveragePane
	},
	members: {
		slug: 'members',
		heading: 'Members',
		color: 'teal',
		component: MembersPane
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

					{TABS_ORDER.map(tab => (
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
						{TABS_ORDER.map(tab => {
						const Component = TABS[tab].component;
						return(
							<Route exact path={TABS[tab].slug} key={tab} >
								<Component />
							</Route>
						)})}
					</Switch>
				</Segment>

			</Grid.Row>

		</React.Fragment>
	);
}

export default Admin;


							// position={TABS[tab].position ? TABS[tab].position : false}



// 						{/* Theme Settings */}
// 						<Route exact path={TABS.settings.slug} >
// 							<SettingsPane />
// 						</Route>
//
// 						{/* Members */}
// 						<Route exact path={TABS.members.slug} >
// 							<MembersPane />
// 						</Route>
//
// 						{/* Organizations */}
// 						<Route exact path={TABS.orgs.slug} >
// 							<OrganizationsPane />
// 						</Route>
//
// 						{/* Chit Voting */}
// 						<Route exact path={TABS.chits.slug} >
// 							<ChitVotingPane />
// 						</Route>
//
// 						{/* Allocation Voting */}
// 						<Route exact path={TABS.money.slug} >
// 							<AllocationPane />
// 						</Route>
//
// 						{/* Remaining Leverage Distribution */}
// 						<Route exact path={TABS.leverage.slug} >
// 							<LeveragePane />
// 						</Route>
//
// 						{/* Presentation Controls */}
// 						<Route exact path={TABS.presentation.slug} >
// 							<PresentationPane />
// 						</Route>

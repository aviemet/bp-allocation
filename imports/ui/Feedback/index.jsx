import { Meteor } from 'meteor/meteor';
import React, { useState, useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Route, Switch } from 'react-router-dom';

import { Themes } from '/imports/api';

import { ThemeContext, PresentationSettingsContext, OrganizationContext } from '/imports/context';

import { Loader, Grid, Header, Menu, Segment } from 'semantic-ui-react'
import styled from 'styled-components';

import { AllocationPane, LeveragePane } from '/imports/ui/Admin/Panes';
import Organizations from './Organizations';
import Stats from './Stats';
import Graph from './Graph';
import MembersList from '/imports/ui/Admin/Panes/MembersPane/MembersList';

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

/**
 * Orgs:
 *   Chit voting inputs (if not using kiosk for chits)
 *   TopOrgs display
 *
 * Members:
 *   Lists members
 *   Check marks next to those who have finished voting (if using kiosk for funds)
 *
 * Allocation:
 *   Shows the graph
 *   TopOrgs round voting inputs (if not using kiosk for funds)
 *
 * Leverage:
 *   Shows leverage rounds information
 *
 * Stats:
 *   Brief rundown of interesting stats
 *   Expoort buttons for information
 */

const TABS_ORDER = ['orgs', 'members', 'allocation', 'graph', 'leverage', 'stats'];
const TABS = {
	orgs:{
		slug: 'orgs',
		heading: 'Organizations',
		color: 'green',
		component: Organizations
	},
	members: {
		slug: 'members',
		heading: 'Members',
		color: 'teal',
		component: MembersList
	},
	allocation: {
		slug: 'allocation',
		heading: 'Allocation',
		color: 'orange',
		component: AllocationPane
	},
	graph: {
		slug: 'graph',
		heading: 'Graph',
		color: 'violet',
		component: Graph
	},
	leverage: {
		slug: 'leverage',
		heading: 'Leverage',
		color: 'violet',
		component: LeveragePane
	},
	stats: {
		slug: 'stats',
		heading: 'Stats',
		color: 'violet',
		component: Stats
	}
};

// Main class for the Theme page
const Feedback = props => {
	const defaultPage = 'orgs';

	const { theme, themeLoading } = useContext(ThemeContext);
	const { settingsLoading }     = useContext(PresentationSettingsContext);
	const { orgsLoading }         = useContext(OrganizationContext);

	const [ activeTab, setActiveTab ] = useState(location.hash.replace(/#/, '') || TABS[defaultPage].slug)

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
						{TABS_ORDER.map(tab => {
						const Component = TABS[tab].component;
						return(
							<Route exact path={TABS[tab].slug} key={tab} >
								<Component hideAdminFields={true} />
							</Route>
						)})}
					</Switch>
				</Segment>

			</Grid.Row>

		</React.Fragment>
	);
}

export default Feedback;

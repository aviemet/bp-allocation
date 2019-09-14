import React, { useState } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import { useTheme } from '/imports/stores/AppContext';
import { Loader, Grid, Header, Menu, Segment, Container } from 'semantic-ui-react';
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
const Admin1 = props => {
	const theme = useTheme();

	const [ activeTab, setActiveTab ] = useState(location.hash.replace(/#/, '') || TABS.settings.slug);

	const handleItemClick = (e, { slug }) => {
		location.hash = slug;
		setActiveTab(slug);
	};

	if(!theme) return <Loader />;

	return (
		<React.Fragment>

			<Grid.Row>
				<Title as='h1'>Allocation Night for { theme.title }</Title>
			</Grid.Row>

			<Grid.Row>
				<TabMenu attached='top' tabular>

					{TABS_ORDER.map(tab => (
						<Menu.Item key={ tab }
							name={ TABS[tab].heading }
							slug={ TABS[tab].slug }
							active={ activeTab === TABS[tab].slug }
							onClick={ handleItemClick }
							color={ TABS[tab].color }
						/>
					))}

				</TabMenu>

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

			</Grid.Row>

		</React.Fragment>
	);
};



const Admin = () => {
	return (
		<Container>
			<Segment>
				<Switch>
					<Route exact path={ ['/admin/:id', '/admin/:id/settings'] } component={ SettingsPane } />
					<Route exact path='/admin/:id/orgs' component={ OrganizationsPane } />
					<Route exact path='/admin/:id/members' component={ MembersPane } />
					<Route exact path='/admin/:id/chits' component={ ChitVotingPane } />
					<Route exact path='/admin/:id/allocation' component={ AllocationPane } />
					<Route exact path='/admin/:id/leverage' component={ LeveragePane } />
					<Route exact path='/admin/:id/presentation' component={ PresentationPane } />
				</Switch>	
			</Segment>
		</Container>
	);
};

export default Admin;

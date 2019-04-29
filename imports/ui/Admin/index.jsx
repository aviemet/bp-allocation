import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Route, Switch } from 'react-router-dom';

import { Themes } from '/imports/api';

import { withContext } from '/imports/api/Context';

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
class Admin extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			activeItem: location.hash.replace(/#/, '') || TABS.settings.slug
		}
	}

	handleItemClick = (e, {slug}) => {
		location.hash = slug;
		this.setState({ activeItem: slug });
	}

	render() {
		let title = this.props.loading ? '' : this.props.theme.title;

		const { activeItem } = this.state;
		return (
			<React.Fragment>

				<Grid.Row>
					<Title as='h1'>Allocation Night for {title}</Title>
				</Grid.Row>

				<Grid.Row>
					<TabMenu attached='top' tabular>

						{TABS_ORDER.map((tab) => (
							<Menu.Item key={tab}
								position={TABS[tab].position ? TABS[tab].position : ''}
								name={TABS[tab].heading}
								slug={TABS[tab].slug}
								active={activeItem === TABS[tab].slug}
								onClick={this.handleItemClick}
								color={TABS[tab].color}
							/>
						))}

					</TabMenu>

					<Segment attached="bottom">
						<Switch location={{pathname: this.state.activeItem}}>

							{/* Theme Settings */}
							<Route exact path={TABS.settings.slug} render={props => (
								<SettingsPane {...this.props} />
							)} />

							{/* Organizations */}
							<Route exact path={TABS.orgs.slug} render={props => (
								<OrganizationsPane {...this.props} />
							)} />

							{/* Chit Voting */}
							<Route exact path={TABS.chits.slug} render={props => (
								<ChitVotingPane {...this.props} />
							)} />

							{/* Allocation Voting */}
							<Route exact path={TABS.money.slug} render={props => (
								<AllocationPane {...this.props} />
							)} />

							{/* Remaining Leverage Distribution */}
							<Route exact path={TABS.leverage.slug} render={props => (
								<LeveragePane {...this.props} />
							)} />

							{/* Presentation Controls */}
							<Route exact path={TABS.presentation.slug} render={props => (
								<PresentationPane {...this.props} />
							)} />

						</Switch>
					</Segment>

				</Grid.Row>

			</React.Fragment>
		);
	}
}

export default withContext(Admin);

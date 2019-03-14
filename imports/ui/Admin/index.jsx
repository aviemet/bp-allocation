import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Route, Switch } from 'react-router-dom';

import { Themes } from '/imports/api';

import { ThemeMethods } from '/imports/api/methods';
import { ThemeContext, withContext } from '/imports/ui/Contexts';

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

const TABS = {
	orgs:{
		slug: 'orgs',
		heading: 'Organizations'
	},
	chits: {
		slug: 'chits',
		heading: 'Chit Voting'
	},
	money: {
		slug: 'money',
		heading: 'Allocation'
	},
	settings: {
		slug: 'settings',
		heading: 'Theme Settings'
	},
	presentation: {
		slug: 'presentation',
		heading: 'Presentation'
	},
	leverage: {
		slug: 'leverage',
		heading: 'Leverage'
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
		const { activeItem } = this.state;

		if(this.props.loading){
			return(<Loader/>)
		}
		return (
			<React.Fragment>

				<Grid.Row>
					<Title as='h1'>Allocation Night for {this.props.theme.title}</Title>
				</Grid.Row>

				<Grid.Row>
					<TabMenu attached='top' tabular>
						<Menu.Item name={TABS.settings.heading} slug={TABS.settings.slug} active={activeItem === TABS.settings.slug} onClick={this.handleItemClick} color='blue' />
						<Menu.Item name={TABS.orgs.heading} slug={TABS.orgs.slug} active={activeItem === TABS.orgs.slug} onClick={this.handleItemClick} color='green' />
						<Menu.Item name={TABS.chits.heading} slug={TABS.chits.slug} active={activeItem === TABS.chits.slug} onClick={this.handleItemClick} color='brown' />
						<Menu.Item name={TABS.money.heading} slug={TABS.money.slug} active={activeItem === TABS.money.slug} onClick={this.handleItemClick} color='orange' />
						<Menu.Item name={TABS.leverage.heading} slug={TABS.leverage.slug} active={activeItem === TABS.leverage.slug} onClick={this.handleItemClick} color='violet' />

						<Menu.Menu position='right'>
							<Menu.Item name={TABS.presentation.heading} slug={TABS.presentation.slug} active={activeItem === TABS.presentation.slug} onClick={this.handleItemClick} color='pink' />
						</Menu.Menu>
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
								<AllocationPane theme={this.props.theme} orgs={this.props.topOrgs} />
							)} />

							{/* Remaining Leverage Distribution */}
							<Route exact path={TABS.leverage.slug} render={props => (
								<LeveragePane {...this.props} />
							)} />

							{/* Presentation Controls */}
							<Route exact path={TABS.presentation.slug} render={props => (
								<PresentationPane themeId={this.props.theme._id} {...props} />
							)} />

						</Switch>
					</Segment>

				</Grid.Row>

			</React.Fragment>
		);
	}
}

export default withContext(Admin);

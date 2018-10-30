import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Route, Switch } from 'react-router-dom';

import { Themes } from '/imports/api';

import { ThemeContext } from '/imports/ui/Contexts';

import { Loader, Grid, Header, Menu, Segment } from 'semantic-ui-react'

import OrganizationPane from '/imports/ui/Admin/Panes/OrganizationPane';
import ChitVotingPane from '/imports/ui/Admin/Panes/ChitVotingPane';
import DollarVotingPane from '/imports/ui/Admin/Panes/DollarVotingPane';
import SettingsPane from '/imports/ui/Admin/Panes/SettingsPane';
import PresentationPane from '/imports/ui/Admin/Panes/PresentationPane';

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
		heading: 'Dollar Voting'
	},
	settings: {
		slug: 'settings',
		heading: 'Theme Settings'
	},
	presentation: {
		slug: 'presentation',
		heading: 'presentation'
	}
};

// Main class for the Theme page
class Theme extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			activeItem: TABS.orgs.slug
		}
	}

	handleItemClick = (e, {slug}) => this.setState({ activeItem: slug })

	render() {
		const { activeItem } = this.state;

		if(this.props.loading){
			return(<Loader/>)
		}
		return (
			<React.Fragment>

				<Grid.Row>
					<Header as='h1'>Settings for the theme</Header>
				</Grid.Row>

				<Grid.Row>
					<Menu attached='top' tabular>
						<Menu.Item name={TABS.orgs.heading} slug={TABS.orgs.slug} active={activeItem === TABS.orgs.slug} onClick={this.handleItemClick} />
						<Menu.Item name={TABS.chits.heading} slug={TABS.chits.slug} active={activeItem === TABS.chits.slug} onClick={this.handleItemClick} />
						<Menu.Item name={TABS.money.heading} slug={TABS.money.slug} active={activeItem === TABS.money.slug} onClick={this.handleItemClick} />
						<Menu.Item name={TABS.settings.heading} slug={TABS.settings.slug} active={activeItem === TABS.settings.slug} onClick={this.handleItemClick} />
						<Menu.Menu position='right'>
							<Menu.Item name={TABS.presentation.heading} slug={TABS.presentation.slug} active={activeItem === TABS.presentation.slug} onClick={this.handleItemClick} />
						</Menu.Menu>
					</Menu>
					<ThemeContext.Provider value={this.props.theme}>
						<Segment attached="bottom">
							<Switch location={{pathname: this.state.activeItem}}>

								{/* Theme Settings */}
								<Route exact path={TABS.settings.slug} render={props => (
									<SettingsPane themeId={this.props.theme._id} {...props} />
								)} />

								{/* Organizations */}
								<Route exact path={TABS.orgs.slug} render={props => (
									<OrganizationPane themeId={this.props.theme._id} {...props} />
								)} />

								{/* Chit Voting */}
								<Route exact path={TABS.chits.slug} render={props => (
									<ChitVotingPane themeId={this.props.theme._id} {...props} />
								)} />

								{/* Dollar Voting */}
								<Route exact path={TABS.money.slug} render={props => (
									<DollarVotingPane theme={this.props.theme} />
								)} />

								{/* Presentation Controls */}
								<Route exact path={TABS.presentation.slug} render={props => (
									<PresentationPane themeId={this.props.theme._id} {...props} />
								)} />

							</Switch>
						</Segment>
					</ThemeContext.Provider>
				</Grid.Row>

			</React.Fragment>
		);
	}
}

export default withTracker(({id}) => {
	themesHandle = Meteor.subscribe('themes', id);

	return {
		loading: !themesHandle.ready(),
		theme: Themes.find({_id: id}).fetch()[0]
	};
})(Theme);


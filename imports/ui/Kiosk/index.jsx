import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'underscore';

import { Loader, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { KIOSK_PAGES } from '/imports/utils';

import { ThemeContext, withContext } from '/imports/ui/Contexts';
import { Themes, Organizations, Images } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import KioskInfo from './KioskInfo';
import KioskChitVoting from './KioskChitVoting';
import KioskFundsVoting from './KioskFundsVoting';

class Kiosk extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			displayPage: KIOSK_PAGES.info
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if(this.props.theme.chit_voting_active !== prevProps.theme.chit_voting_active ||
		   this.props.theme.funds_voting_active !== prevProps.theme.funds_voting_active) {
			let displayPage = this.props.theme.chit_voting_active ? KIOSK_PAGES.chit :
												this.props.theme.funds_voting_active ? KIOSK_PAGES.funds :
												KIOSK_PAGES.info;
			this.setState({
				displayPage: displayPage
			});
		}
	}

	render() {
		const { displayPage } = this.state;

		if(this.props.loading){
			return(<Loader/>)
		}
		return (
			<React.Fragment>
				<Switch location={{pathname: this.state.displayPage}}>

					{/* Theme Settings */}
					<Route exact path={KIOSK_PAGES.info} render={props => (
						<KioskInfo {...this.props} />
					)} />

					{/* Organizations */}
					<Route exact path={KIOSK_PAGES.chit} render={props => (
						<KioskChitVoting {...this.props} />
					)} />

					{/* Chit Voting */}
					<Route exact path={KIOSK_PAGES.funds} render={props => (
						<KioskFundsVoting {...this.props} />
					)} />

				</Switch>
			</React.Fragment>
		);
	}
}

export default withContext(Kiosk);

import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { Loader, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { KIOSK_PAGES } from '/imports/utils';

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
		if(this.props.theme.chitVotingActive !== prevProps.theme.chitVotingActive ||
		   this.props.theme.fundsVotingActive !== prevProps.theme.fundsVotingActive) {

			let displayPage = this.props.theme.chitVotingActive ? KIOSK_PAGES.chit :
												this.props.theme.fundsVotingActive ? KIOSK_PAGES.funds :
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

export default Kiosk;

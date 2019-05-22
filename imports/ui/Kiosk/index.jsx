import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { Loader, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { KIOSK_PAGES } from '/imports/utils';

import { Themes, Organizations, Images } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';
import { usePresentationSettings } from '/imports/context';

import KioskInfo from './KioskInfo';
import KioskChitVoting from './KioskChitVoting';
import KioskFundsVoting from './KioskFundsVoting';

// Transition group definitions
const FADE_DURATION = 300;

const defaultStyle = {
	transition: `opacity ${FADE_DURATION}ms ease-in-out`,
	opacity: 0
};

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 }
};

const PageFader = styled.div`
	opacity: 0;
`;

// Kiosk Component
const Kiosk = props => {

	const [ displayPage, setDisplayPage ] = useState(KIOSK_PAGES.info);
	const [ show, setShow ] = useState(true);

	const { settings, settingsLoading } = usePresentationSettings();

	useEffect(() => {
		if(settingsLoading) return;

		if(settings.chitVotingActive) {
			doNavigation(KIOSK_PAGES.chit);
		} else if(settings.fundsVotingActive) {
			doNavigation(KIOSK_PAGES.funds);
		} else {
			doNavigation(KIOSK_PAGES.info);
		}
	});

	const doNavigation = page => {
		if(displayPage !== page) {
			setShow(false);

			setTimeout(() => {
				setDisplayPage(page);
				setShow(true);
			}, FADE_DURATION);
		}
	}

	if(settingsLoading){
		return(<Loader/>)
	}

	console.log({chit: settings.chitVotingActive, funds: settings.fundsVotingActive});

	return (
		<Transition in={show} timeout={FADE_DURATION}>
			{(state) => (
			<PageFader style={{...defaultStyle, ...transitionStyles[state]}}>
				<Switch location={{pathname: displayPage}}>

					{/* Orgs Grid */}
					<Route exact path={KIOSK_PAGES.info} render={props => (
						<KioskInfo />
					)} />

					{/* Chit Voting */}
					<Route exact path={KIOSK_PAGES.chit} render={props => (
						<KioskChitVoting />
					)} />

					{/* Funds Voting */}
					<Route exact path={KIOSK_PAGES.funds} render={props => (
						<KioskFundsVoting />
					)} />

				</Switch>

			</PageFader>
			)}
		</Transition>
	);
}

export default Kiosk;

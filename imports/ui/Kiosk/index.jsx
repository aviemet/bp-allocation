import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import styled from 'styled-components';

import { KIOSK_PAGES } from '/imports/lib/utils';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { withRouter } from 'react-router-dom';

import KioskInfo from './Info/KioskInfo';
import KioskChitVoting from './ChitVoting/KioskChitVoting';
import FundsVotingKiosk from './FundsVoting';
import MemberLoginRequired from './MemberLoginRequired';

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
const Kiosk = withRouter(observer(props => {
	const { settings } = useData();

	const [ displayPage, setDisplayPage ] = useState(KIOSK_PAGES.info);
	const [ show, setShow ] = useState(true);

	useEffect(() => {
		if(settings.chitVotingActive) {
			doNavigation(KIOSK_PAGES.chit);
		} else if(settings.fundsVotingActive) {
			doNavigation(KIOSK_PAGES.funds);
		} else {
			doNavigation(KIOSK_PAGES.info);
		}
	}, [settings.chitVotingActive, settings.fundsVotingActive]);

	const doNavigation = page => {
		if(displayPage !== page) {
			setShow(false);

			setTimeout(() => {
				setDisplayPage(page);
				setShow(true);
			}, FADE_DURATION);
		}
	};

	const member = props.match.params.member;

	return (
		<Transition in={ show } timeout={ FADE_DURATION }>
			{(state) => (
				<PageFader style={ { ...defaultStyle, ...transitionStyles[state] } }>
					<Switch location={ { pathname: displayPage } }>

						{/* Orgs Grid */}
						<Route exact path={ KIOSK_PAGES.info } render={ props => (
							<KioskInfo />
						) } />

						{/* Chit Voting 
						<Route exact path={ KIOSK_PAGES.chit } render={ props => (
							<MemberLoginRequired component={ KioskChitVoting } />
						) } /> */}

						{/* Funds Voting */}
						<Route exact path={ KIOSK_PAGES.funds } render={ props => (
							<MemberLoginRequired member={ member && member } component={ FundsVotingKiosk } />
						) } />

					</Switch>

				</PageFader>
			)}
		</Transition>
	);
}));

export default Kiosk;

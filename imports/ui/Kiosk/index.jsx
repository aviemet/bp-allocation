import React, { useState, useEffect, useRef } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router-dom';
import { useData } from '/imports/api/stores/lib/DataProvider';

import KioskInfo from './Info/KioskInfo';
// import KioskChitVoting from './ChitVoting/KioskChitVoting';
import FundsVotingKiosk from './FundsVoting';
import MemberLoginRequired from './MemberLoginRequired';
import RemoteVoting from './RemoteVoting';
import Results from '/imports/ui/Presentation/Pages/Results';
import Awards from './Awards';

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
	const data = useData();
	const { theme, settings, KIOSK_PAGES } = data;

	const activePage = settings.fundsVotingActive ? KIOSK_PAGES.funds : KIOSK_PAGES.info;
	const [ displayPage, setDisplayPage ] = useState(activePage); // Active presentation page
	const [ show, setShow ] = useState(true); // Transition values

	const timeoutRef = useRef();

	useEffect(() => {
		let pageNav;
		// Funds voting is active
		if(settings.fundsVotingActive) {
			// Show the voting page:
			pageNav = KIOSK_PAGES.funds;
		// Funds voting is not active
		} else {
			// Voting inactive, votes have been cast, and results have been shown
			if(theme.votingStarted && settings.resultsVisited) {
				// Show results page
				pageNav = KIOSK_PAGES.results;
			// Voting inactive and (no votes yet cast || results not yet shown)
			} else {
				// Show orgs page
				pageNav = KIOSK_PAGES.info;
			}
		}

		// Wait 1 minute before navigating a user away from a voting screen
		if(displayPage === KIOSK_PAGES.funds && !settings.fundsVotingActive) {
			timeoutRef.current = setTimeout(() => doNavigation(pageNav), data.votingRedirectTimeout * 1000);
		} else {
			clearTimeout(timeoutRef.current);
			doNavigation(pageNav);
		}
	}, [settings.fundsVotingActive, settings.resultsVisited]);

	// Change the active presentation page
	const doNavigation = page => {
		clearTimeout(timeoutRef.current);
		if(displayPage !== page) {
			setShow(false);

			setTimeout(() => {
				setDisplayPage(page);
				setShow(true);
			}, FADE_DURATION);
		}
	};

	// const voting = props.location.pathname.startsWith('/voting');
	const member = props.match.params.member;
	
	return (
		<Transition in={ show } timeout={ FADE_DURATION }>
			{(state) => (
				<PageFader style={ { ...defaultStyle, ...transitionStyles[state] } }>
					<Switch location={ { pathname: displayPage } }>

						{/* Orgs Grid */}
						<Route exact path={ KIOSK_PAGES.info } render={ () => (
							<KioskInfo />
						) } />

						{/* Funds Voting */}
						<Route exact path={ KIOSK_PAGES.funds } render={ () => {
							return member ? 
								<RemoteVoting member={ member } /> :
								<MemberLoginRequired component={ FundsVotingKiosk } />;
						} } />

						{/* Voting Results */}
						<Route exact path={ KIOSK_PAGES.results } component={ settings.awardsPresentation ? Awards : Results } />

					</Switch>

				</PageFader>
			)}
		</Transition>
	);
}));

export default Kiosk;

/* Chit Voting 
<Route exact path={ KIOSK_PAGES.chit } render={ props => (
	<MemberLoginRequired component={ KioskChitVoting } />
) } /> 

 onVotingComplete={ () => (doNavigation(KIOSK_PAGES.info)) }
*/
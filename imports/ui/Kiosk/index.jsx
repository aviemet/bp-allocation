import React, { useState, useEffect, useRef } from 'react'
import { Route, Switch, useRouteMatch } from 'react-router-dom'
import { Transition } from 'react-transition-group'

import styled from '@emotion/styled'

import { observer } from 'mobx-react-lite'
import { useData, useTheme, useSettings } from '/imports/api/providers'

import KioskInfo from './Info/KioskInfo'
import ChitVotingKiosk from './ChitVoting'
import FundsVotingKiosk from './FundsVoting'
import Topups from './Topups'
import MemberLoginRequired from './MemberLoginRequired'
import RemoteVoting from './RemoteVoting'
import Results from '/imports/ui/Presentation/Pages/Results'
import Awards from './Awards'

const Kiosk = observer(() => {
	const match = useRouteMatch('/voting/:id/:member')

	const data = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()

	const activePage = settings.fundsVotingActive ? data.KIOSK_PAGES.funds : data.KIOSK_PAGES.info

	const [ displayPage, setDisplayPage ] = useState(activePage) // Active presentation page
	const [ show, setShow ] = useState(false) // Transition values

	const timeoutRef = useRef()

	const getActivePage = () => {
		if(settings.fundsVotingActive) {
			// Show the funds allocation voting page:
			return data.KIOSK_PAGES.funds
		} else if(settings.chitVotingActive) {
			// Show the chit voting page:
			return data.KIOSK_PAGES.chit
		} else if(member && settings.topupsActive) {
			// Show the topups pledge screen to members
			return data.KIOSK_PAGES.topups
		// Chit and Funds voting are not active
		} else {
			// Voting inactive, votes have been cast, and results have been shown
			if(theme.fundsVotingStarted && settings.resultsVisited) {
				// Show results page
				return data.KIOSK_PAGES.results
			// Voting inactive and (no votes yet cast || results not yet shown)
			} else {
				// Show orgs page
				return data.KIOSK_PAGES.info
			}
		}
	}

	useEffect(() => {
		if(!themeLoading && !settingsLoading) {
			setShow(true)
		}
	}, [themeLoading, settingsLoading])

	useEffect(() => {
		let pageNav = getActivePage()
		console.log({ pageNav })

		// Wait 1 minute before navigating a user away from a voting screen
		if(
			(displayPage === data.KIOSK_PAGES.funds && !settings.fundsVotingActive) ||
			(displayPage === data.KIOSK_PAGES.chit && !settings.chitVotingActive)
		) {
			timeoutRef.current = setTimeout(() => doNavigation(pageNav), data.votingRedirectTimeout * 1000)
		} else {
			clearTimeout(timeoutRef.current)
			doNavigation(pageNav)
		}
	}, [settings.fundsVotingActive, settings.chitVotingActive, settings.topupsActive, settings.resultsVisited])

	// Change the active presentation page
	const doNavigation = page => {
		clearTimeout(timeoutRef.current)
		if(displayPage !== page) {
			setShow(false)

			setTimeout(() => {
				setDisplayPage(page)
				setShow(true)
			}, FADE_DURATION)
		}
	}

	const member = match?.params?.member

	return (
		<Transition in={ show } timeout={ FADE_DURATION }>
			{ state => (
				<PageFader style={ { ...defaultStyle, ...transitionStyles[state] } }>
					<Switch location={ { pathname: displayPage } }>

						{/* Orgs Grid */}
						<Route exact path={ data.KIOSK_PAGES.info } render={ () => <KioskInfo /> } />

						{/* Chit Voting */}
						<Route exact path={ data.KIOSK_PAGES.chit } render={ () => {
							return member ?
								// If member is set, navigation comes from the short link for voting remotely
								<RemoteVoting member={ member } component={ ChitVotingKiosk } /> :
								// Otherwise kiosk voting in the room, members must login to proceed
								<MemberLoginRequired component={ ChitVotingKiosk } />
						} } />

						{/* Topups */}
						<Route exact path={ data.KIOSK_PAGES.topups } render={ () => (
							// If member is set, navigation comes from the short link for voting remotely
							<RemoteVoting member={ member } component={ Topups } />
						) } />

						{/* Funds Voting */}
						<Route exact path={ data.KIOSK_PAGES.funds } render={ () => {
							return member ?
								// If member is set, navigation comes from the short link for voting remotely
								<RemoteVoting member={ member } component={ FundsVotingKiosk } /> :
								// Otherwise kiosk voting in the room, members must login to proceed
								<MemberLoginRequired component={ FundsVotingKiosk } />
						} } />

						{/* Voting Results */}
						<Route exact path={ data.KIOSK_PAGES.results } component={ settings.awardsPresentation ? Awards : Results } />

					</Switch>

				</PageFader>
			) }
		</Transition>
	)
})

// Transition group definitions
const FADE_DURATION = 300

const defaultStyle = {
	transition: `opacity ${FADE_DURATION}ms ease-in-out`,
	opacity: 0
}

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 }
}

const PageFader = styled.div`
	opacity: 0;
	max-width: 100vw;
	min-height: 100%;
`

export default Kiosk

import styled from "@emotion/styled"
import { useParams } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import { useState, useEffect, useRef, useCallback } from "react"
import { Transition, type TransitionStatus } from "react-transition-group"

import { useData, useTheme, useSettings } from "/imports/api/providers"
import ChitVotingKiosk from "./ChitVoting"
import FundsVotingKiosk from "./FundsVoting"
import KioskInfo from "./Info/KioskInfo"
import MemberLoginRequired from "./MemberLoginRequired"
import RemoteVoting from "./RemoteVoting"
import Topups from "./Topups"
import Results from "../Presentation/Results"

type KioskPage = "info" | "chit" | "funds" | "topups" | "results"
type TimerRef = ReturnType<typeof setTimeout>

const Kiosk = observer(() => {
	const params = useParams({ strict: false })
	const member = params?.member

	const data = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()

	const activePage: KioskPage = settings?.fundsVotingActive ? data.KIOSK_PAGES.funds : data.KIOSK_PAGES.info

	const [ displayPage, setDisplayPage ] = useState<KioskPage>(activePage)
	const [ show, setShow ] = useState(false)

	const timeoutRef = useRef<TimerRef | undefined>(undefined)

	const doNavigation = useCallback((page: KioskPage) => {
		clearTimeout(timeoutRef.current)
		if(displayPage !== page) {
			setShow(false)

			setTimeout(() => {
				setDisplayPage(page)
				setShow(true)
			}, FADE_DURATION)
		}
	}, [displayPage])

	const getActivePage = useCallback((): KioskPage => {
		if(!settings) return data.KIOSK_PAGES.info

		if(settings.fundsVotingActive) {
			return data.KIOSK_PAGES.funds
		} else if(settings.chitVotingActive) {
			return data.KIOSK_PAGES.chit
		} else if(member && settings.topupsActive) {
			return data.KIOSK_PAGES.topups
		} else {
			if(theme?.fundsVotingStarted && settings.resultsVisited) {
				return data.KIOSK_PAGES.results
			} else {
				return data.KIOSK_PAGES.info
			}
		}
	}, [settings, member, theme, data.KIOSK_PAGES])

	useEffect(() => {
		if(!themeLoading && !settingsLoading) {
			setShow(true)
		}
	}, [themeLoading, settingsLoading])

	useEffect(() => {
		const pageNav = getActivePage()

		if(!settings) return

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
	}, [data.KIOSK_PAGES.chit, data.KIOSK_PAGES.funds, data.votingRedirectTimeout, displayPage, doNavigation, getActivePage, settings])

	const renderPage = () => {
		switch(displayPage) {
			case data.KIOSK_PAGES.info:
				return <KioskInfo />
			case data.KIOSK_PAGES.chit:
				return member ?
					<RemoteVoting memberId={ member } component={ ChitVotingKiosk } /> :
					<MemberLoginRequired component={ ChitVotingKiosk } />
			case data.KIOSK_PAGES.topups:
				return <RemoteVoting memberId={ member } component={ Topups } />
			case data.KIOSK_PAGES.funds:
				return member ?
					<RemoteVoting memberId={ member } component={ FundsVotingKiosk } /> :
					<MemberLoginRequired component={ FundsVotingKiosk } />
			case data.KIOSK_PAGES.results:
				return <Results />
			default:
				return <KioskInfo />
		}
	}

	return (
		<Transition in={ show } timeout={ FADE_DURATION }>
			{ state => (
				<PageFader style={ { ...defaultStyle, ...transitionStyles[state] } }>
					{ renderPage() }
				</PageFader>
			) }
		</Transition>
	)
})

// Transition group definitions
const FADE_DURATION = 300

const defaultStyle = {
	transition: `opacity ${FADE_DURATION}ms ease-in-out`,
	opacity: 0,
	width: "100%",
}

const transitionStyles: Record<TransitionStatus, { opacity: number }> = {
	entering: { opacity: 0 },
	entered: { opacity: 1 },
	exiting: { opacity: 0 },
	exited: { opacity: 0 },
	unmounted: { opacity: 0 },
}

const PageFader = styled.div`
	opacity: 0;
	max-width: 100vw;
	min-height: 100%;
`

export default Kiosk

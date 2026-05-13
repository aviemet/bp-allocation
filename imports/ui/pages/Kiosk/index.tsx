import styled from "@emotion/styled"
import { useParams } from "@tanstack/react-router"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"

import { useData } from "/imports/api/providers"
import { ChitVotingKiosk } from "./ChitVoting"
import { FundsVotingKiosk } from "./FundsVoting"
import { KioskInfo } from "./Info/KioskInfo"
import { MemberLoginRequired } from "./MemberLoginRequired"
import { Pledges } from "./Pledges"
import { RemoteVoting } from "./RemoteVoting"
import { Results } from "../Presentation/Results"
import { useSettings, useTheme } from "/imports/api/hooks"

type KioskPage = "info" | "chit" | "funds" | "pledges" | "results"
type TimerRef = ReturnType<typeof setTimeout>

export const Kiosk = () => {
	const params = useParams({ strict: false })
	const member = params?.member

	const data = useData()
	const { theme, themeLoading } = useTheme()
	const { settings, settingsLoading } = useSettings()

	const activePage = useMemo<KioskPage>(() => {
		if(settings?.fundsVotingActive) {
			return data.KIOSK_PAGES.funds
		}

		if(settings?.chitVotingActive) {
			return data.KIOSK_PAGES.chit
		}

		if(member && settings?.topupsActive) {
			return data.KIOSK_PAGES.pledges
		}

		if(theme?.fundsVotingStarted && settings?.resultsVisited) {
			return data.KIOSK_PAGES.results
		}

		return data.KIOSK_PAGES.info
	}, [
		data.KIOSK_PAGES.chit,
		data.KIOSK_PAGES.funds,
		data.KIOSK_PAGES.info,
		data.KIOSK_PAGES.results,
		data.KIOSK_PAGES.pledges,
		member,
		settings?.chitVotingActive,
		settings?.fundsVotingActive,
		settings?.resultsVisited,
		settings?.topupsActive,
		theme?.fundsVotingStarted,
	])

	const [ displayPage, setDisplayPage ] = useState<KioskPage>(activePage)
	const [ transitioning, setTransitioning ] = useState<boolean>(false)

	const ready = !themeLoading && !settingsLoading
	const show = ready && !transitioning

	const timeoutRef = useRef<TimerRef | undefined>(undefined)

	const doNavigation = useCallback((page: KioskPage) => {
		clearTimeout(timeoutRef.current)
		if(displayPage !== page) {
			setTransitioning(true)

			setTimeout(() => {
				setDisplayPage(page)
				setTransitioning(false)
			}, FADE_DURATION)
		}
	}, [displayPage])

	useEffect(() => {
		if(displayPage === activePage) return

		const shouldDelayFunds = displayPage === data.KIOSK_PAGES.funds && settings?.fundsVotingActive === false
		const shouldDelayChit = displayPage === data.KIOSK_PAGES.chit && settings?.chitVotingActive === false

		// Wait 1 minute before navigating a user away from a voting screen
		const delay = (shouldDelayFunds || shouldDelayChit) ? data.votingRedirectTimeout * 1000 : 0

		const timeout = setTimeout(() => doNavigation(activePage), delay)
		timeoutRef.current = timeout

		return () => {
			clearTimeout(timeout)
			timeoutRef.current = undefined
		}
	}, [
		activePage,
		data.KIOSK_PAGES.chit,
		data.KIOSK_PAGES.funds,
		data.votingRedirectTimeout,
		displayPage,
		doNavigation,
		settings?.chitVotingActive,
		settings?.fundsVotingActive,
	])

	const renderPage = () => {
		switch(displayPage) {
			case data.KIOSK_PAGES.info:
				return <KioskInfo />
			case data.KIOSK_PAGES.chit:
				return member ?
					<RemoteVoting memberId={ member } component={ ChitVotingKiosk } /> :
					<MemberLoginRequired component={ ChitVotingKiosk } />
			case data.KIOSK_PAGES.pledges:
				return <RemoteVoting memberId={ member } component={ Pledges } />
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
		<PageFader visible={ show }>
			{ renderPage() }
		</PageFader>
	)
}

const FADE_DURATION = 300

const PageFader = styled.div<{ visible: boolean }>`
	opacity: ${props => props.visible ? 1 : 0};
	transition: opacity ${FADE_DURATION}ms ease-in-out;
	max-width: 100vw;
	min-height: 100%;
	width: 100%;
`


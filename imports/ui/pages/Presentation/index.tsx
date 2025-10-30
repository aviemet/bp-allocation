import styled from "@emotion/styled"
import { useNavigate, useParams } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import { useState, useEffect } from "react"
import { Transition } from "react-transition-group"
import { useTheme, useSettings } from "/imports/api/providers"

import Allocation from "./Allocation"
import Intro from "./Intro"
import Orgs from "./Orgs"
import Results from "./Results"
import Timer from "./Timer"
import TopOrgs from "./TopOrgs"
import { Loading } from "/imports/ui/components"

// Transition group definitions
const FADE_DURATION = 300

const defaultStyle = {
	transition: `opacity ${FADE_DURATION}ms ease-in-out`,
	opacity: 0,
}

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 },
	exiting: { opacity: 0 },
	exited: { opacity: 0 },
	unmounted: { opacity: 0 },
}

const PageFader = styled.div`
	opacity: 0;
`

const Presentation = observer(() => {
	const { theme, isLoading: themeLoading } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()
	const navigate = useNavigate()
	const params = useParams({ from: "/presentation/$id" })

	const [ show, setShow ] = useState(true)

	// TODO: wait for image load before showing page
	const doNavigation = (currentPage: string) => {
		let page = `/presentation/${params.id}/${currentPage}`
		if(globalThis.location.pathname !== page && show) {
			setShow(false)

			globalThis.setTimeout(() => {
				navigate({ to: page })
				setShow(true)
			}, FADE_DURATION)
		}
	}

	useEffect(() => {
		if(!settingsLoading) doNavigation(settings.currentPage)
	}, [settings.currentPage, settingsLoading, doNavigation])

	// Component doesn't update from mobx changes unless they are referenced
	const title = theme.title || ""
	const question = theme.question || ""

	if(themeLoading || settingsLoading) return <Loading />
	const renderPage = () => {
		const currentPage = settings.currentPage

		switch(currentPage) {
			case "intro":
				return <Intro title={ title } question={ question } />
			case "orgs":
				return <Orgs />
			case "timer":
				return <Timer seconds={ settings.timerLength } />
			case "toporgs":
				return <TopOrgs />
			case "allocation":
				return <Allocation />
			case "results":
				return <Results />
			default:
				return <Intro title={ title } question={ question } />
		}
	}

	return (
		<Transition in={ show } timeout={ FADE_DURATION }>
			{ (state) => (
				<PageFader style={ { ...defaultStyle, ...transitionStyles[state], width: "100%" } } id="presentationFader">
					{ renderPage() }
				</PageFader>
			) }
		</Transition>
	)
})


export default Presentation

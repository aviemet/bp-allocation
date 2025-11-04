import styled from "@emotion/styled"
import { useNavigate, useParams } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import { useState, useEffect, useCallback } from "react"
import { useTheme, useSettings } from "/imports/api/providers"

import Allocation from "./Allocation"
import Intro from "./Intro"
import Orgs from "./Orgs"
import Results from "./Results"
import Timer from "./Timer"
import TopOrgs from "./TopOrgs"
import { Loading } from "/imports/ui/components"

const FADE_DURATION = 300

const PageFader = styled.div<{ visible: boolean }>`
	opacity: ${props => props.visible ? 1 : 0};
	transition: opacity ${FADE_DURATION}ms ease-in-out;
	width: 100%;
`

const Presentation = observer(() => {
	const { theme, isLoading: themeLoading } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()
	const navigate = useNavigate()
	const params = useParams({ from: "/presentation/$id" })

	const [ show, setShow ] = useState(true)

	const doNavigation = useCallback((currentPage: string) => {
		if(!settings) return
		let page = `/presentation/${params.id}/${currentPage}`
		if(globalThis.location.pathname !== page && show) {
			setShow(false)

			globalThis.setTimeout(() => {
				navigate({ to: page })
				setShow(true)
			}, FADE_DURATION)
		}
	}, [params.id, show, settings, navigate])

	useEffect(() => {
		if(!settingsLoading && settings && settings.currentPage) {
			doNavigation(settings.currentPage)
		}
	}, [settings?.currentPage, settingsLoading, doNavigation, settings])

	if(themeLoading || settingsLoading || !theme || !settings) return <Loading />

	const title = theme.title || ""
	const question = theme.question || ""

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
				return <Allocation simulation={ false } />
			case "results":
				return <Results />
			default:
				return <Intro title={ title } question={ question } />
		}
	}

	return (
		<PageFader visible={ show } id="presentationFader">
			{ renderPage() }
		</PageFader>
	)
})


export default Presentation

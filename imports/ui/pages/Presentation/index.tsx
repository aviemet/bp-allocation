import { useNavigate, useParams } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import { useTheme, useSettings } from "/imports/api/providers"

import Allocation from "./Allocation"
import Intro from "./Intro"
import Orgs from "./Orgs"
import Results from "./Results"
import Timer from "./Timer"
import TopOrgs from "./TopOrgs"
import { Loading, PageTransitionFader } from "/imports/ui/components"

const Presentation = observer(() => {
	const { theme, isLoading: themeLoading } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()
	const navigate = useNavigate()
	const params = useParams({ strict: false })

	const title = theme?.title || ""
	const question = theme?.question || ""

	useEffect(() => {
		if(settingsLoading || !settings || !settings.currentPage) {
			return
		}

		const id = params.id
		if(id) {
			const targetPath = `/presentation/${id}/${settings.currentPage}`
			if(globalThis.location.pathname !== targetPath) {
				navigate({ to: targetPath })
			}
		}
	}, [settings?.currentPage, settingsLoading, params.id, navigate, settings])

	if(themeLoading || settingsLoading || !theme || !settings || !settings.currentPage) {
		return <Loading />
	}

	return (
		<PageTransitionFader currentPage={ settings.currentPage } id="presentationFader">
			{ (page) => {
				switch(page) {
					case "intro":
						return <Intro title={ title } question={ question } />
					case "orgs":
						return <Orgs />
					case "timer":
						return <Timer seconds={ settings.timerLength || 600 } />
					case "toporgs":
						return <TopOrgs />
					case "allocation":
						return <Allocation simulation={ false } />
					case "results":
						return <Results />
					default:
						return <Intro title={ title } question={ question } />
				}
			} }
		</PageTransitionFader>
	)
})


export default Presentation

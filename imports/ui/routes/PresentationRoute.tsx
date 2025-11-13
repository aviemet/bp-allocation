import { Navigate, useParams } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { useData } from "/imports/api/providers"
import { useTheme, useOrgs, useSettings } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { PresentationLayout } from "/imports/ui/layouts"
import Presentation from "../pages/Presentation"

const PresentationRoute = () => {
	const params = useParams({ strict: false })
	const id = params.id
	const data = useData()
	const { theme, themeLoading } = useTheme()
	const { orgsLoading } = useOrgs()
	const { settingsLoading } = useSettings()

	const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

	useEffect(() => {
		if(id) {
			data.setThemeId(id)
		}
	}, [id, data])

	useEffect(() => {
		const loadingTest = themeLoading || orgsLoading || settingsLoading
		if(loadingTest !== isLoading) {
			setIsLoading(loadingTest)
		}
	}, [themeLoading, orgsLoading, settingsLoading, isLoading])

	if(isLoading) {
		return <Loading />
	}

	if(!theme) {
		return <Navigate to="/404" />
	}

	return (
		<PresentationLayout>
			<Presentation />
		</PresentationLayout>
	)
}

export default PresentationRoute

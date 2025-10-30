import { Navigate, useParams } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"

import { useData, useTheme, useOrgs, useSettings } from "/imports/api/providers"
import { Loading } from "/imports/ui/components"
import { PresentationLayout } from "/imports/ui/layouts"
import Presentation from "../pages/Presentation"

const PresentationRoute = observer(() => {
	const { id } = useParams({ from: "/presentation/$id" })
	const data = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	const { isLoading: orgsLoading } = useOrgs()
	const { isLoading: settingsLoading } = useSettings()

	const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

	useEffect(() => {
		data.themeId = id
	}, [id])

	useEffect(() => {
		const loadingTest = themeLoading || orgsLoading || settingsLoading
		if(loadingTest !== isLoading) {
			setIsLoading(loadingTest)
		}
	}, [themeLoading, orgsLoading, settingsLoading])

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
})

export default PresentationRoute

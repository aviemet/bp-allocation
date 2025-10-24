import { useParams } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useData, useTheme, useOrgs, useSettings } from "/imports/api/providers"
import { Loading } from "/imports/ui/Components"
import { PresentationLayout } from "/imports/ui/Layouts"
import Simulation from "/imports/ui/Admin/Simulation"

const SimulationRoute = observer(() => {
	const { id } = useParams({ from: "/simulation/$id" })
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

	return (
		<PresentationLayout>
			<Simulation />
		</PresentationLayout>
	)
})

export default SimulationRoute

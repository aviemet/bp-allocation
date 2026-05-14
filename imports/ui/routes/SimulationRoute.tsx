import { useParams } from "@tanstack/react-router"
import { useEffect, useMemo } from "react"

import { useData } from "/imports/api/providers"
import { useTheme, useSettings } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { PresentationLayout } from "/imports/ui/layouts"
import { Simulation } from "../pages/Admin/Simulation"

export const SimulationRoute = () => {
	const { id } = useParams({ from: "/simulation/$id" })
	const data = useData()
	const { themeLoading } = useTheme()
	const { settingsLoading } = useSettings()

	const isLoading = useMemo(() => (
		themeLoading || settingsLoading
	), [themeLoading, settingsLoading])

	useEffect(() => {
		data.setThemeId(id)
	}, [id, data])

	return (
		<PresentationLayout>
			{ isLoading ? <Loading /> : <Simulation /> }
		</PresentationLayout>
	)
}

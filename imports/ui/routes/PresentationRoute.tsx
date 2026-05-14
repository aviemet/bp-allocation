import { Navigate, useParams } from "@tanstack/react-router"
import { useEffect, useMemo, type ReactNode } from "react"

import { useData } from "/imports/api/providers"
import { useTheme, useSettings } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { PresentationLayout } from "/imports/ui/layouts"
import { Presentation } from "../pages/Presentation"

export const PresentationRoute = () => {
	const params = useParams({ strict: false })
	const id = params.id
	const data = useData()
	const { theme, themeLoading } = useTheme()
	const { settingsLoading } = useSettings()

	const isLoading = useMemo(() => (
		themeLoading || settingsLoading
	), [themeLoading, settingsLoading])

	useEffect(() => {
		if(id) {
			data.setThemeId(id)
		}
	}, [id, data])

	let content: ReactNode
	if(isLoading) {
		content = <Loading />
	} else if(!theme) {
		content = <Navigate to="/404" />
	} else {
		content = <Presentation />
	}

	return (
		<PresentationLayout>
			{ content }
		</PresentationLayout>
	)
}

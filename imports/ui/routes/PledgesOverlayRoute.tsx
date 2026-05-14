import { Navigate, useParams } from "@tanstack/react-router"
import { useEffect, useMemo } from "react"

import { useData } from "/imports/api/providers"
import { useTheme } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { PledgesOverlayDisplay } from "../pages/Extra/PledgesOverlayDisplay"

export const PledgesOverlayRoute = () => {
	const params = useParams({ strict: false })
	const id = params.id
	const data = useData()
	const { theme, themeLoading } = useTheme()

	const isLoading = useMemo(() => (
		themeLoading
	), [themeLoading])

	useEffect(() => {
		if(id) {
			data.setThemeId(id)
		}
	}, [id, data])

	if(isLoading) {
		return <Loading />
	}

	if(!theme) {
		return <Navigate to="/404" />
	}

	return <PledgesOverlayDisplay />
}

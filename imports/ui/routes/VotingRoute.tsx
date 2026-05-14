import { useParams } from "@tanstack/react-router"
import { useEffect, useMemo } from "react"

import { useData } from "/imports/api/providers"
import { useTheme, useSettings } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { KioskLayout } from "/imports/ui/layouts"
import { Kiosk } from "../pages/Kiosk"

export const VotingRoute = () => {
	const { id } = useParams({ from: "/voting/$id/$member" })
	const data = useData()
	const { themeLoading } = useTheme()
	const { settingsLoading } = useSettings()

	const isLoading = useMemo(() => (
		themeLoading || settingsLoading
	), [themeLoading, settingsLoading])

	useEffect(() => {
		data.setThemeId(id)
	}, [id, data])

	if(isLoading) {
		return <Loading />
	}

	return (
		<KioskLayout>
			<Kiosk />
		</KioskLayout>
	)
}

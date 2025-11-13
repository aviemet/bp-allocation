import { useParams } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { useData } from "/imports/api/providers"
import { useTheme, useOrgs, useSettings } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { KioskLayout } from "/imports/ui/layouts"
import Kiosk from "../pages/Kiosk"

const KioskRoute = () => {
	const { id } = useParams({ from: "/kiosk/$id" })
	const data = useData()
	const { themeLoading } = useTheme()
	const { orgsLoading } = useOrgs()
	const { settingsLoading } = useSettings()

	const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

	useEffect(() => {
		data.setThemeId(id)
	}, [id, data])

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
		<KioskLayout>
			<Kiosk />
		</KioskLayout>
	)
}

export default KioskRoute

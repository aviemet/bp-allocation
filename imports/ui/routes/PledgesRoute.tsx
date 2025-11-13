import { useParams } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { useData } from "/imports/api/providers"
import { useTheme, useOrgs, useSettings } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { KioskLayout } from "/imports/ui/layouts"
import Pledges from "../pages/Pledges"

const PledgesRoute = () => {
	const { id } = useParams({ from: "/pledges/$id" })
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
			<Pledges />
		</KioskLayout>
	)
}

export default PledgesRoute

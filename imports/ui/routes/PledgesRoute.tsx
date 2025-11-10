import { useParams } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import { useEffect, useState } from "react"

import { useData, useTheme, useOrgs, useSettings } from "/imports/api/providers"
import { Loading } from "/imports/ui/components"
import { KioskLayout } from "/imports/ui/layouts"
import Pledges from "../pages/Pledges"

const PledgesRoute = observer(() => {
	const { id } = useParams({ from: "/pledges/$id" })
	const data = useData()
	const { isLoading: themeLoading } = useTheme()
	const { isLoading: orgsLoading } = useOrgs()
	const { isLoading: settingsLoading } = useSettings()

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
})

export default PledgesRoute

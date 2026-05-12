import { useParams } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { useEffect } from "react"

import { Themes } from "/imports/api/db"
import { useData } from "/imports/api/providers"
import { Loading } from "/imports/ui/components"
import { KioskLayout } from "/imports/ui/layouts"
import { InPersonPledge } from "/imports/ui/pages/InPersonPledge"

export const InPersonPledgeRoute = () => {
	const { themeId } = useParams({ from: "/pledges/inperson/$themeId" })
	const data = useData()

	const { theme, themeReady } = useTracker(() => {
		const subscription = Meteor.subscribe("theme", themeId)
		const ready = subscription.ready()
		const theme = Themes.findOne({ _id: themeId })
		return { theme, themeReady: ready }
	}, [themeId])

	useEffect(() => {
		if(theme?._id) {
			data.setThemeId(theme._id)
		}
	}, [theme?._id, data])

	if(!themeReady || !theme) return <Loading />

	return (
		<KioskLayout>
			<InPersonPledge />
		</KioskLayout>
	)
}

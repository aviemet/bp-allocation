import { Navigate, useParams } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { Themes, Members } from "/imports/api/db"
import { Loading } from "/imports/ui/components"

const ShortRouteComponent = () => {
	const { themeSlug, memberCode } = useParams({ from: "/v/$themeSlug/$memberCode" })

	const data = useTracker(() => {
		const themeSubscription = Meteor.subscribe("themeBySlug", themeSlug)
		const themeReady = themeSubscription.ready()
		const theme = Themes.findOne({ slug: themeSlug })
		const hasThemeData = themeReady && Themes.find().count() > 0

		let membersSubscription: Meteor.SubscriptionHandle | undefined
		let memberReady = false
		let member: ReturnType<typeof Members.findOne> | undefined

		if(theme && themeReady) {
			membersSubscription = Meteor.subscribe("members", { themeId: theme._id })
			memberReady = membersSubscription.ready()
		}

		if(membersSubscription) {
			member = Members.findOne({ code: memberCode })
		}

		const hasMemberData = !theme || (memberReady && Members.find().count() > 0)
		const allDataLoaded = hasThemeData && (theme ? hasMemberData : true)

		return {
			allDataLoaded,
			hasThemeData,
			hasMemberData,
			theme,
			member,
		}
	}, [themeSlug, memberCode])

	if(!data.allDataLoaded) {
		return <Loading />
	}

	if(data.theme && data.member) {
		return <Navigate to={ `/voting/${data.theme._id}/${data.member._id}` } />
	}

	if((data.hasThemeData && !data.theme) || (data.hasMemberData && data.theme && data.member === undefined)) {
		return <Navigate to="/404" />
	}

	return <Loading />
}

export default ShortRouteComponent


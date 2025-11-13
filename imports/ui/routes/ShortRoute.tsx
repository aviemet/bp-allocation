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

		let membersSubscription: Meteor.SubscriptionHandle | undefined
		let memberReady = false
		let member: ReturnType<typeof Members.findOne> | undefined

		if(theme && themeReady) {
			membersSubscription = Meteor.subscribe("members", { themeId: theme._id })
			memberReady = membersSubscription.ready()
			if(memberReady) {
				member = Members.findOne({ code: memberCode })
			}
		}

		const allDataLoaded = themeReady && (!theme || memberReady)

		return {
			allDataLoaded,
			themeReady,
			memberReady,
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

	if((data.themeReady && !data.theme) || (data.memberReady && data.theme && !data.member)) {
		return <Navigate to="/404" />
	}

	return <Loading />
}

export default ShortRouteComponent


import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useTracker } from 'meteor/react-meteor-data'
import { Themes, Members } from '/imports/api/db'
import { Loading } from '/imports/ui/Components'

const ShortRoute = () => {
	const { themeSlug, memberCode } = useParams()

	const data = useTracker(() => {
		let theme: Theme | undefined
		let member: Member | undefined
		let membersSubscription: Meteor.SubscriptionHandle | undefined

		const themeSubscription = Meteor.subscribe('themeBySlug', themeSlug, {
			onReady: () => {
				theme = Themes.find({ slug: themeSlug }).fetch()[0]
				membersSubscription = Meteor.subscribe('members', { themeId: theme._id }, {
					onReady: () => {
						member = Members.find({ code: memberCode }).fetch()[0]
					},
				})
			},
		})

		return {
			isLoading: !themeSubscription.ready() || !membersSubscription?.ready(),
			theme,
			member,
			route: { themeSlug, memberCode },
		}
	}, [themeSlug, memberCode])

	if(data.isLoading) return <Loading />

	if(data.theme && data.member) {
		// TODO: This is a hack because Redirect isn't working properly
		// window.location.href = `/voting/${data.theme._id}/${data.member._id}`
		return <Navigate to={ `/voting/${data.theme._id}/${data.member._id}` } />
	}

	return <Navigate to='/404' />
}

export default ShortRoute

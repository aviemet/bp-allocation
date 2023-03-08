import { Meteor } from 'meteor/meteor'
import React, { useEffect } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTracker } from 'meteor/react-meteor-data'
import { Themes, Members } from '/imports/api/db'
import { Loading } from '/imports/ui/Components'

const ShortRoute = () => {
	const params = useParams()
	const navigate = useNavigate()

	const data = useTracker(() => {
		let theme: Theme | undefined
		let member: Member | undefined
		let membersSubscription: Meteor.SubscriptionHandle | undefined

		const themeSubscription = Meteor.subscribe('themeBySlug', params.themeSlug, {
			onReady: () => {
				theme = Themes.find({ slug: params.themeSlug }).fetch()[0]
				membersSubscription = Meteor.subscribe('members', { themeId: theme._id }, {
					onReady: () => {
						member = Members.find({ code: params.memberCode }).fetch()[0]
					},
				})
			},
		})

		return {
			isLoading: !themeSubscription.ready() || !membersSubscription?.ready(),
			theme,
			member,
			route: { themeSlug: params.themeSlug, memberCode: params.memberCode },
		}
	}, [params.themeSlug, params.memberCode])

	useEffect(() => {
		if(data.theme && data.member) {
			navigate(`/voting/${data.theme._id}/${data.member._id}`)
		}
	}, [data.theme, data.member])

	if(data.isLoading) return <Loading />
	return <></>

	if(data.theme && data.member) {
		// TODO: This is a hack because Navigate isn't working properly
		// window.location.href = `/voting/${data.theme._id}/${data.member._id}`
		return <Navigate to={ `/voting/${data.theme._id}/${data.member._id}` } />
	}

	return <Navigate to='/404' />
}

export default ShortRoute

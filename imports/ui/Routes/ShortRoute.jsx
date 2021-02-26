import { Meteor } from 'meteor/meteor'
import React from 'react'
import { Redirect } from 'react-router-dom'
import { useTracker } from 'meteor/react-meteor-data'

import { Themes, Members } from '/imports/api/db'

import { Loader } from 'semantic-ui-react'


const ShortRoute = matchProps => {
	const { themeSlug, memberCode } = matchProps.match.params

	const data = useTracker(() => {
		let theme
		let member
		let membersSubscription
		const themeSubscription = Meteor.subscribe('themeBySlug', themeSlug, {
			onReady: () => {
				theme = Themes.find({ slug: themeSlug }).fetch()[0]
				membersSubscription = Meteor.subscribe('members', { themeId: theme._id }, {
					onReady: () => {
						member = Members.find({ code: memberCode }).fetch()[0]
					}
				})
			}
		})

		return {
			isLoading: !themeSubscription.ready() || !membersSubscription.ready(),
			theme,
			member,
			route: matchProps
		}
	}, [themeSlug, memberCode])

	if(data.isLoading) return <Loader active />

	if(data.theme && data.member) {
		// TODO: This is a hack because Redirect isn't working properly
		window.location.href = `/voting/${data.theme._id}/${data.member._id}`
		return <Redirect push to={ `/voting/${data.theme._id}/${data.member._id}` } />
	}

	return <Redirect to='/404' />
}

export default ShortRoute

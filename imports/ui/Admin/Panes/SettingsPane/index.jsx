import React, { useState, useEffect } from 'react'
import { Tab } from 'semantic-ui-react'
import { useRouteMatch, useHistory } from 'react-router-dom'
import GeneralSettings from './GeneralSettings'
import MessageSettings from './MessageSettings'
import AdvancedSettings from './AdvancedSettings'

const panes = [
	{ menuItem: 'General', slug: 'general', render: () => <Tab.Pane><GeneralSettings /></Tab.Pane> },
	{ menuItem: 'Messages', slug: 'messages', render: () => <Tab.Pane><MessageSettings /></Tab.Pane> },
	{ menuItem: 'Advanced', slug: 'advanced', render: () => <Tab.Pane><AdvancedSettings /></Tab.Pane> },
]

const tabIndex = tab => {
	if(tab === undefined) return 0
	return panes.findIndex(pane => pane.slug.toLowerCase() === tab.toLowerCase()) || 0
}

const Settings = () => {
	const history = useHistory()
	// Redirect in routes file should prevent match from ever being undefined
	const match = useRouteMatch('/admin/:id/settings/:activeTab')
	const [activeTab, setActiveTab] = useState(tabIndex(match.params.activeTab))

	useEffect(() => {
		setActiveTab(tabIndex(match.params.activeTab))
	}, [match.params.activeTab])

	const handleTabChange = (_, { activeIndex }) => {
		history.push(`/admin/${match.params.id}/settings/${panes[activeIndex].slug}`)
	}

	return (
		<Tab
			panes={ panes }
			activeIndex={ activeTab }
			onTabChange={ handleTabChange }
		/>
	)
}

export default Settings

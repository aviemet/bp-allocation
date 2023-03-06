import React from 'react'
// import { Route, useMatch } from 'react-router-dom'
import { Link } from '/imports/ui/Components'
import { Box,Tab,Tabs } from '@mui/material'
import GeneralSettings from './GeneralSettings'
import MessageSettings from './MessageSettings'
import AdvancedSettings from './AdvancedSettings'

const panes = [
	{
		label: 'General',
		slug: 'general',
		render: <GeneralSettings />,
	},
	{
		label: 'Messages',
		slug: 'messages',
		render: <MessageSettings />,
	},
	{
		label: 'Advanced',
		slug: 'advanced',
		render: <AdvancedSettings />,
	},
]

const Settings = () => {
	const params = useMatch('/admin/:id/settings/:activeTab')

	return (
		<>
			<Tabs value={ `/admin/${params?.params.id}/settings/${params?.params.activeTab}` }>
				{ panes.map(pane => (
					<Tab
						key={ `tab-${pane.slug}` }
						label={ pane.label }
						value={ `/admin/${params?.params.id}/settings/${pane.slug}` }
						to={ `/admin/${params?.params.id}/settings/${pane.slug}` }
						component={ Link }
					/>
				)) }
			</Tabs>
			<Box sx={ { mt: 2 } }>
				{ panes.map(pane => (
					<Route
						key={ `content-${pane.slug}` }
						path={ `/admin/:id/settings/${pane.slug}` }
						element={ pane.render }
					/>
				)) }
			</Box>
		</>
	)
}

export default Settings

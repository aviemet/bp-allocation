import React from 'react'
import { Route, useMatch, useNavigate } from 'react-router-dom'
import { Link } from '/imports/ui/Components'
import { Box,Tab,Tabs } from '@mui/material'
import GeneralSettings from './GeneralSettings'
import MessageSettings from './MessageSettings'
import AdvancedSettings from './AdvancedSettings'
import { useData } from '/imports/api/providers'

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
	const { themeId } = useData()
	const params = useMatch('/admin/:id/settings/:activeTab')
	const navigate = useNavigate()

	if(!themeId) return <></>

	if(!params?.params?.activeTab) navigate(`/admin/${themeId}/settings/general`)

	return (
		<>
			<Tabs value={ `/admin/${themeId}/settings/${params?.params.activeTab}` }>
				{ panes.map(pane => (
					<Tab
						key={ `tab-${pane.slug}` }
						label={ pane.label }
						value={ `/admin/${themeId}/settings/${pane.slug}` }
						to={ `/admin/${themeId}/settings/${pane.slug}` }
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

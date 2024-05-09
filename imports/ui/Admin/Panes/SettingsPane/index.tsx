import React, { useEffect } from 'react'
import { Route, Routes, useMatch, useNavigate } from 'react-router-dom'
import { Link } from '/imports/ui/Components'
import { Box, Tab, Tabs } from '@mui/material'
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

	useEffect(() => {
		if(!params?.params?.activeTab) navigate(`/admin/${themeId}/settings/general`)
	}, [params?.params?.activeTab])

	const activeTab = params?.params.activeTab || panes[0].slug

	return (
		<>
			<Tabs value={ activeTab }>
				{ panes.map(pane => (
					<Tab
						key={ pane.slug }
						label={ pane.label }
						value={ pane.slug }
						to={ `/admin/${themeId}/settings/${pane.slug}` }
						component={ Link }
					/>
				)) }
			</Tabs>

			<Box sx={ { mt: 2 } }>
				{ panes.map(pane => (
					<SettingsTabPanel key={ pane.slug } value={ activeTab } index={ pane.slug }>
						{ pane.render }
					</SettingsTabPanel>
				)) }
			</Box>
		</>
	)
}

interface SettingsTabPanelProps {
	children: React.ReactNode
	value: string
	index: string
}

const SettingsTabPanel = ({ children, value, index }: SettingsTabPanelProps) => {
	return (
		<Box
			role="tabpanel"
			hidden={ value !== index }
			id={ `settings-tabpanel-${index}` }
		>
			{ value === index && (
				<Box sx={ { p: 3 } }>
					{ children }
				</Box>
			) }
		</Box>
	)
}

export default Settings

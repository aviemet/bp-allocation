import React from "react"
import { Route, Link, useRouteMatch } from "react-router-dom"

import {
	Box,
	Tab,
	Tabs,
} from "@mui/material"

import GeneralSettings from "./GeneralSettings"
import MessageSettings from "./MessageSettings"
import AdvancedSettings from "./AdvancedSettings"

const panes = [
	{
		label: "General",
		slug: "general",
		render: <GeneralSettings />,
	},
	{
		label: "Messages",
		slug: "messages",
		render: <MessageSettings />,
	},
	{
		label: "Advanced",
		slug: "advanced",
		render: <AdvancedSettings />,
	},
]

const Settings = () => {
	const { params } = useRouteMatch("/admin/:id/settings/:activeTab")

	return (
		<>
			<Tabs value={ `/admin/${params.id}/settings/${params.activeTab}` }>
				{ panes.map(pane => (
					<Tab
						key={ `tab-${pane.slug}` }
						label={ pane.label }
						value={ `/admin/${params.id}/settings/${pane.slug}` }
						to={ `/admin/${params.id}/settings/${pane.slug}` }
						component={ Link }
					/>
				)) }
			</Tabs>
			<Box sx={ { mt: 2 } }>
				{ panes.map(pane => (
					<Route
						key={ `content-${pane.slug}` }
						path={ `/admin/:id/settings/${pane.slug}` }
						render={ () => pane.render }
					/>
				)) }
			</Box>
		</>
	)
}

export default Settings

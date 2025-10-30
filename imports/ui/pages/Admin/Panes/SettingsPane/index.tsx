import {
	Box,
	Tab,
	Tabs,
} from "@mui/material"
import { Link, useParams } from "@tanstack/react-router"
import React from "react"


import AdvancedSettings from "./AdvancedSettings"
import GeneralSettings from "./GeneralSettings"
import MessageSettings from "./MessageSettings"

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
	// Get params safely - only if we're on a route with an ID and activeTab
	let params = {}
	try {
		params = useParams({ from: "/admin/$id/settings/$activeTab" })
	} catch(error) {
		// We're not on a route with the expected structure, params will be empty
		params = {}
	}

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
				{ panes.map(pane => {
					if(pane.slug === params.activeTab) {
						return <div key={ `content-${pane.slug}` }>{ pane.render }</div>
					}
					return null
				}) }
			</Box>
		</>
	)
}

export default Settings

import {
	Box,
	Tab,
	Tabs,
} from "@mui/material"
import { Link, useParams } from "@tanstack/react-router"


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
	const params = useParams({ strict: false })
	const themeId = params.id
	const activeTab = params.activeTab ?? panes[0].slug

	if(!themeId) return null

	const tabsValue = `/admin/${themeId}/settings/${activeTab}`
	const selectedPane = panes.find(pane => pane.slug === activeTab)

	return (
		<>
			<Tabs value={ tabsValue }>
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
				{ selectedPane ? <div key={ `content-${selectedPane.slug}` }>{ selectedPane.render }</div> : null }
			</Box>
		</>
	)
}

export default Settings

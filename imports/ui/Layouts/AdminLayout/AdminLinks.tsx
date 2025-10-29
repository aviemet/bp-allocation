import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import AllInclusiveIcon from "@mui/icons-material/AllInclusive"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import BusinessIcon from "@mui/icons-material/Business"
import EmailIcon from "@mui/icons-material/Email"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import PeopleIcon from "@mui/icons-material/People"
import PieChartIcon from "@mui/icons-material/PieChart"
import SettingsIcon from "@mui/icons-material/Settings"
import StarIcon from "@mui/icons-material/Star"
import {
	Collapse,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
} from "@mui/material"
import { Link } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useData } from "/imports/api/providers"

const navLinks = [
	{
		id: "orgs",
		title: "Orgs",
		icon: BusinessIcon,
		route: (themeId: string) => `/admin/${themeId}/orgs`,
		color: "teal",
	},
	{
		id: "members",
		title: "Members",
		icon: PeopleIcon,
		route: (themeId: string) => `/admin/${themeId}/members`,
		color: "violet",
	},
	{
		id: "chits",
		title: "Chit Votes",
		icon: StarIcon,
		route: (themeId: string) => `/admin/${themeId}/chits`,
		color: "brown",
	},
	{
		id: "allocation",
		title: "Allocations",
		icon: AttachMoneyIcon,
		route: (themeId: string) => `/admin/${themeId}/allocation`,
		color: "green",
	},
	{
		id: "pledges",
		title: "Pledges",
		icon: AccountBalanceWalletIcon,
		route: (themeId: string) => `/admin/${themeId}/pledges`,
		color: "green",
	},
	{
		id: "leverage",
		title: "Leverage",
		icon: PieChartIcon,
		route: (themeId: string) => `/admin/${themeId}/leverage`,
		color: "orange",
	},
	{
		id: "messaging",
		title: "Messaging",
		icon: EmailIcon,
		route: (themeId: string) => `/admin/${themeId}/messaging`,
		color: "olive",
	},
]

const bottomLinks = [
	{
		id: "kiosk",
		title: "Kiosk",
		route: (themeId: string) => `/kiosk/${themeId}`,
		newTab: false,
	},
	{
		id: "presentation",
		title: "Presentation",
		route: (themeId: string) => `/presentation/${themeId}`,
		newTab: true,
	},
	{
		id: "pledges",
		title: "Pledges",
		route: (themeId: string) => `/pledges/${themeId}`,
		newTab: true,
	},
]

interface LinksProps {
	activeMenuItem: string
}

const Links = observer(({ activeMenuItem }: LinksProps) => {
	const data = useData()

	const [pagesOpen, setPagesOpen] = useState(false)

	const togglePagesOpen = () => {
		setPagesOpen(!pagesOpen)
	}

	return (
		<>
			<List>
				{ navLinks.map(link => {
					const Icon = link.icon
					return (
						<ListItemButton key={ link.id } component={ Link } to={ link.route(data.themeId) } selected={ activeMenuItem === link.id }>
							{ Icon && <ListItemIcon><Icon /></ListItemIcon> }
							<ListItemText primary={ link.title } />
						</ListItemButton>
					)
				}) }
			</List>

			<Divider />

			<List>
				<ListItemButton component={ Link } to={ `/admin/${data.themeId}/settings` } selected={ activeMenuItem === "settings" } >
					<ListItemIcon><SettingsIcon /></ListItemIcon>
					<ListItemText primary="Settings" />
				</ListItemButton>
			</List>

			<Divider />

			<List>
				<ListItemButton component={ Link } to={ `/admin/${data.themeId}/overview` } selected={ activeMenuItem === "overview" } >
					<ListItemIcon><AllInclusiveIcon /></ListItemIcon>
					<ListItemText primary="Overview" />
				</ListItemButton>
			</List>

			<Divider />

			<List>
				<ListItemButton onClick={ togglePagesOpen }>
					<ListItemIcon>
						{ pagesOpen ? <ExpandLess /> : <ExpandMore /> }
					</ListItemIcon>
					<ListItemText primary="Pages" />
				</ListItemButton>
				<Collapse in={ pagesOpen } timeout="auto" unmountOnExit>
					<List>
						{ bottomLinks.map(link => {
							const linkProps = {}
							if(link.newTab) {
								linkProps.target = "_blank"
								linkProps.rel = "noopener noreferrer"
							}
							return (
								<ListItem
									key={ link.id }
									button
									component={ Link }
									to={ link.route(data.themeId) }
									secondaryAction={ link.newTab && <OpenInNewIcon /> }
									{ ...linkProps }
								>
									<ListItemText primary={ link.title } />
								</ListItem>
							)
						}) }
					</List>
				</Collapse>
			</List>

		</>
	)
})

export default Links

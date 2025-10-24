import React, { useState } from "react"
import PropTypes from "prop-types"
import { Link } from "react-router-dom"

import {
	Collapse,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
} from "@mui/material"

import BusinessIcon from "@mui/icons-material/Business"
import PeopleIcon from "@mui/icons-material/People"
import StarIcon from "@mui/icons-material/Star"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import PieChartIcon from "@mui/icons-material/PieChart"
import EmailIcon from "@mui/icons-material/Email"
import SettingsIcon from "@mui/icons-material/Settings"
import AllInclusiveIcon from "@mui/icons-material/AllInclusive"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

import { observer } from "mobx-react-lite"
import { useData } from "/imports/api/providers"

const navLinks = [
	{
		id: "orgs",
		title: "Orgs",
		icon: BusinessIcon,
		route: themeId => `/admin/${themeId}/orgs`,
		color: "teal",
	},
	{
		id: "members",
		title: "Members",
		icon: PeopleIcon,
		route: themeId => `/admin/${themeId}/members`,
		color: "violet",
	},
	{
		id: "chits",
		title: "Chit Votes",
		icon: StarIcon,
		route: themeId => `/admin/${themeId}/chits`,
		color: "brown",
	},
	{
		id: "allocation",
		title: "Allocations",
		icon: AttachMoneyIcon,
		route: themeId => `/admin/${themeId}/allocation`,
		color: "green",
	},
	{
		id: "pledges",
		title: "Pledges",
		icon: AccountBalanceWalletIcon,
		route: themeId => `/admin/${themeId}/pledges`,
		color: "green",
	},
	{
		id: "leverage",
		title: "Leverage",
		icon: PieChartIcon,
		route: themeId => `/admin/${themeId}/leverage`,
		color: "orange",
	},
	{
		id: "messaging",
		title: "Messaging",
		icon: EmailIcon,
		route: themeId => `/admin/${themeId}/messaging`,
		color: "olive",
	},
]

const bottomLinks = [
	{
		id: "kiosk",
		title: "Kiosk",
		route: themeId => `/kiosk/${themeId}`,
		newTab: false,
	},
	{
		id: "presentation",
		title: "Presentation",
		route: themeId => `/presentation/${themeId}`,
		newTab: true,
	},
	{
		id: "pledges",
		title: "Pledges",
		route: themeId => `/pledges/${themeId}`,
		newTab: true,
	},
]

const Links = observer(({ activeMenuItem }) => {
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

Links.propTypes = {
	activeMenuItem: PropTypes.string,
}

export default Links

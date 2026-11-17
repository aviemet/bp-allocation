import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import AllInclusiveIcon from "@mui/icons-material/AllInclusive"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import BarChartIcon from "@mui/icons-material/BarChart"
import BusinessIcon from "@mui/icons-material/Business"
import EmailIcon from "@mui/icons-material/Email"
import PeopleIcon from "@mui/icons-material/People"
import PieChartIcon from "@mui/icons-material/PieChart"
import SettingsIcon from "@mui/icons-material/Settings"
import StarIcon from "@mui/icons-material/Star"
import {
	Divider,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material"
import { Link } from "@tanstack/react-router"
import { type ElementType } from "react"

interface ThemeNavLink {
	id: string
	title: string
	icon: ElementType
	route: (themeId: string) => string
}

const themeNavLinks: ThemeNavLink[] = [
	{
		id: "presentation",
		title: "Presentation",
		icon: BarChartIcon,
		route: (themeId: string) => `/admin/${themeId}/presentation`,
	},
	{
		id: "orgs",
		title: "Orgs",
		icon: BusinessIcon,
		route: (themeId: string) => `/admin/${themeId}/orgs`,
	},
	{
		id: "members",
		title: "Members",
		icon: PeopleIcon,
		route: (themeId: string) => `/admin/${themeId}/members`,
	},
	{
		id: "chits",
		title: "Chit Votes",
		icon: StarIcon,
		route: (themeId: string) => `/admin/${themeId}/chits`,
	},
	{
		id: "allocation",
		title: "Allocations",
		icon: AttachMoneyIcon,
		route: (themeId: string) => `/admin/${themeId}/allocation`,
	},
	{
		id: "pledges",
		title: "Pledges",
		icon: AccountBalanceWalletIcon,
		route: (themeId: string) => `/admin/${themeId}/pledges`,
	},
	{
		id: "leverage",
		title: "Leverage",
		icon: PieChartIcon,
		route: (themeId: string) => `/admin/${themeId}/leverage`,
	},
	{
		id: "messaging",
		title: "Messaging",
		icon: EmailIcon,
		route: (themeId: string) => `/admin/${themeId}/messaging`,
	},
]

interface AdminNavThemeSectionProps {
	themeId: string
	activeMenuItem: string
}

export const AdminNavThemeSection = ({ themeId, activeMenuItem }: AdminNavThemeSectionProps) => {
	return (
		<>
			<Divider />
			<List>
				{ themeNavLinks.map(link => {
					const Icon = link.icon
					return (
						<ListItemButton
							key={ link.id }
							component={ Link }
							to={ link.route(themeId) }
							selected={ activeMenuItem === link.id }
						>
							<ListItemIcon><Icon /></ListItemIcon>
							<ListItemText primary={ link.title } />
						</ListItemButton>
					)
				}) }
			</List>

			<Divider />

			<List>
				<ListItemButton component={ Link } to={ `/admin/${themeId}/settings` } selected={ activeMenuItem === "settings" }>
					<ListItemIcon><SettingsIcon /></ListItemIcon>
					<ListItemText primary="Settings" />
				</ListItemButton>
			</List>

			<Divider />

			<List>
				<ListItemButton component={ Link } to={ `/admin/${themeId}/overview` } selected={ activeMenuItem === "overview" }>
					<ListItemIcon><AllInclusiveIcon /></ListItemIcon>
					<ListItemText primary="Overview" />
				</ListItemButton>
			</List>
		</>
	)
}

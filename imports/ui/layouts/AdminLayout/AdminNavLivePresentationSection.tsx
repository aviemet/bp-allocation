import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import {
	Collapse,
	Divider,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material"
import { Link } from "@tanstack/react-router"
import { useState } from "react"

const bottomLinks = [
	{
		id: "kiosk",
		title: "Kiosk",
		route: (themeId: string) => `/kiosk/${themeId}`,
		newTab: false,
	},
	{
		id: "presentation-show",
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
	{
		id: "pledges-overlay",
		title: "Pledges Overlay",
		route: (themeId: string) => `/pledges-overlay/${themeId}`,
		newTab: true,
	},
]

interface AdminNavLivePresentationSectionProps {
	themeId: string
}

export const AdminNavLivePresentationSection = ({ themeId }: AdminNavLivePresentationSectionProps) => {
	const [pagesOpen, setPagesOpen] = useState(true)

	const togglePagesOpen = () => {
		setPagesOpen(!pagesOpen)
	}

	return (
		<>
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
							const route = link.route(themeId)
							if(link.newTab) {
								return (
									<ListItemButton
										key={ link.id }
										component="a"
										href={ route }
										target="_blank"
										rel="noopener noreferrer"
									>
										<ListItemText primary={ link.title } />
										<ListItemIcon>
											<OpenInNewIcon />
										</ListItemIcon>
									</ListItemButton>
								)
							}
							return (
								<ListItemButton
									key={ link.id }
									component={ Link }
									to={ route }
								>
									<ListItemText primary={ link.title } />
								</ListItemButton>
							)
						}) }
					</List>
				</Collapse>
			</List>
		</>
	)
}

import ListAltIcon from "@mui/icons-material/ListAlt"
import {
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material"
import { Link } from "@tanstack/react-router"

interface AdminNavGlobalProps {
	activeMenuItem: string
}

export const AdminNavGlobal = ({ activeMenuItem }: AdminNavGlobalProps) => {
	return (
		<List>
			<ListItemButton component={ Link } to="/admin" selected={ activeMenuItem === "themes" }>
				<ListItemIcon><ListAltIcon /></ListItemIcon>
				<ListItemText primary="All themes" />
			</ListItemButton>
		</List>
	)
}

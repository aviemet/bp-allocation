import AccountCircle from "@mui/icons-material/AccountCircle"
import BarChartIcon from "@mui/icons-material/BarChart"
import {
	AppBar as MuiAppBar,
	Toolbar,
	Box,
	Drawer,
	IconButton,
	Typography,
	MenuItem,
	Divider,
	Grid,
	Menu,
	Button,
	Tooltip,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { useNavigate, useLocation, useParams, Link, Outlet } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"
import { useState, useEffect, useMemo, type MouseEvent } from "react"

import { AdminLinks } from "./AdminLinks"
import {
	deriveActiveMenuItem,
	isAdminShellPath,
} from "/imports/lib/admin/adminNavContext"
import { useData } from "/imports/api/providers"
import { useTheme } from "/imports/api/hooks"

const drawerWidth = 175

export const AdminLayout = () => {
	const data = useData()
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

	const navigate = useNavigate()
	const location = useLocation()
	const params = useParams({ strict: false })

	const { theme, themeLoading } = useTheme()

	const drawerOpen = useMemo(() => isAdminShellPath(location.pathname), [location.pathname])
	const activeMenuItem = useMemo(() => deriveActiveMenuItem(location.pathname), [location.pathname])
	const themeId = typeof params.id === "string" ? params.id : null

	useEffect(() => {
		if(data) {
			data.setThemeId(themeId)
		}
	}, [themeId, data])

	const handleMenu = (event: MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	useEffect(() => {
		if(data) {
			const heading = typeof theme?.title === "string" && theme.title ? theme.title : data.defaultMenuHeading
			data.setMenuHeading(heading)
		}
	}, [theme, data])

	if(!data) return null

	const presentationPath = themeId && !themeLoading && theme
		? `/admin/${themeId}/presentation`
		: "#"

	let drawerHeaderButton = (
		<Tooltip title="Pick a theme to open presentation controls">
			<span style={ { width: "100%" } }>
				<Button color="warning" disabled fullWidth sx={ { p: 2 } }>
					<BarChartIcon />Presentation
				</Button>
			</span>
		</Tooltip>
	)

	if(themeId) {
		drawerHeaderButton = (
			<Button
				component={ Link }
				color="warning"
				to={ presentationPath }
				fullWidth
				sx={ { p: 2 } }
			>
				<BarChartIcon />Presentation
			</Button>
		)
	}

	return (
		<AdminContainer className="AdminContainer">
			<AppBar position="relative" open={ drawerOpen }>
				<Toolbar>
					<Logo size="mini" src="/img/BPLogo.svg" />
					<Typography variant="h6" component="div" sx={ { flexGrow: 1 } }>
						{ data.menuHeading }
					</Typography>

					<div>
						<IconButton
							size="large"
							aria-label="account of current user"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={ handleMenu }
							color="inherit"
						>
							<AccountCircle />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={ anchorEl }
							anchorOrigin={ {
								vertical: "top",
								horizontal: "right",
							} }
							keepMounted
							transformOrigin={ {
								vertical: "top",
								horizontal: "right",
							} }
							open={ Boolean(anchorEl) }
							onClose={ handleMenuClose }
						>
							<Link to="/admin"><MenuItem>Themes List</MenuItem></Link>
							<Divider />
							<MenuItem onClick={ () => { handleMenuClose(); Meteor.logout(() => navigate({ to: "/login" })) } }>Sign Out</MenuItem>
						</Menu>
					</div>
				</Toolbar>
			</AppBar>

			<Drawer
				sx={ {
					width: drawerWidth,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: drawerWidth,
						boxSizing: "border-box",
					},
				} }
				variant="persistent"
				anchor="left"
				open={ drawerOpen }
			>
				<DrawerHeader>
					{ drawerHeaderButton }
				</DrawerHeader>

				<Divider />

				<AdminLinks activeMenuItem={ activeMenuItem } />
			</Drawer>

			<Main open={ drawerOpen }>
				<Grid container sx={ { flexDirection: "column" } }>
					<Outlet />
				</Grid>
			</Main>

		</AdminContainer>
	)
}

const AdminContainer = styled(Box)`
	background: #FAFCFC;
	width: 100%;
	min-height: 100%;
	padding-bottom: 15px;
`

interface LogoProps {
	size?: "mini" | "medium" | "large"
}

const Logo = styled("img", { shouldForwardProp: (prop) => prop !== "size" })<LogoProps>`
	height: 50px;
	padding-right: 10px;
`

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
	transition: theme.transitions.create(["margin", "width"], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: `${drawerWidth}px`,
		transition: theme.transitions.create(["margin", "width"], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}))

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{ open?: boolean }>(
	({ theme, open }) => ({
		flexGrow: 1,
		padding: theme.spacing(3),
		transition: theme.transitions.create("margin", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: "auto",
		...(open && {
			transition: theme.transitions.create("margin", {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.enteringScreen,
			}),
			marginLeft: `${drawerWidth}px`,
		}),
	}),
)

const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	padding: theme.spacing(0, 1),
	...theme.mixins.toolbar,
	justifyContent: "flex-end",
}))

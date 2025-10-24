import ThemesList from "/imports/ui/Admin/ThemesList"

import styled from "@emotion/styled"
import AccountCircle from "@mui/icons-material/AccountCircle"
import BarChartIcon from "@mui/icons-material/BarChart"
import {
	Container,
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
} from "@mui/material"
import { useNavigate, useLocation, useParams, Link } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"
import { observer } from "mobx-react-lite"
import React, { useState, useEffect } from "react"

import AdminLinks from "./AdminLinks"
import { useData, useTheme } from "/imports/api/providers"

const drawerWidth = 175

const AdminLayout = observer(() => {
	const { theme, isLoading: themeLoading } = useTheme()
	const data = useData()

	const navigate = useNavigate()
	const location = useLocation()
	// Get params safely - only if we're on a route with an ID
	let params = {}
	try {
		params = useParams({ from: "/admin/$id" })
	} catch(error) {
		// We're not on a route with an ID, params will be empty
		params = {}
	}

	const [ anchorEl, setAnchorEl ] = useState(null)
	const [ drawerOpen, setDrawerOpen ] = useState(false)

	useEffect(() => {
		setDrawerOpen(!["/themes", "/admin"].includes(location.pathname))
	}, [location.pathname])

	const handleMenu = event => {
		setAnchorEl(event.currentTarget)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	// const setSidebarVisibilty = () => {
	// 	let showSidebar = window.innerWidth >= layoutTheme.screen.tablet && !/^\/(admin|themes)[/]?$/.test(location.pathname)
	// 	setSidebarVisible(showSidebar)
	// }

	// useEffect(() => {
	// 	setSidebarVisibilty()
	// }, [ location.pathname ])

	// useEffect(() => {
	// 	window.addEventListener('resize', setSidebarVisibilty)
	// 	return () => window.removeEventListener('resize', setSidebarVisibilty)
	// })

	/**
	 * Update the main page heading when the theme changes
	 */
	useEffect(() => {
		data.menuHeading = theme?.title ? theme.title : data.defaultMenuHeading
	}, [theme])

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
					<Button component={ Link } color="warning" to={ themeLoading ? "#" : `/admin/${theme._id}/presentation` } fullWidth sx={ { p: 2 } }><BarChartIcon />Presentation</Button>
				</DrawerHeader>

				<Divider />

				<AdminLinks activeMenuItem={ params?.page || "" } />
			</Drawer>

			<Main open={ drawerOpen }>
				<Container>
					<Grid container>
						<ThemesList />
					</Grid>
				</Container>
			</Main>

		</AdminContainer>
	)
})

const AdminContainer = styled(Box)`
	background: #FAFCFC;
	width: 100%;
	min-height: 100%;
	padding-bottom: 15px;
`

const Logo = styled.img`
	height: 50px;
	padding-right: 10px;
`

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
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

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
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
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: "flex-end",
}))

export default AdminLayout

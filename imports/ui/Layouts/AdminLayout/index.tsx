import { Meteor } from 'meteor/meteor'
import React, { useState, useEffect } from 'react'
import { Outlet, useMatch, useParams } from 'react-router-dom'
import { Link } from '/imports/ui/Components'
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
} from '@mui/material'
import styled from '@emotion/styled'
import AccountCircle from '@mui/icons-material/AccountCircle'
import BarChartIcon from '@mui/icons-material/BarChart'
import AdminLinks from './AdminLinks'
import { observer } from 'mobx-react-lite'
import { useData, useTheme } from '/imports/api/providers'

const drawerWidth = 175

const AdminLayout = observer(() => {
	const { theme, isLoading: themeLoading } = useTheme()
	const data = useData()

	const { page } = useParams()
	const isAdminRoot = useMatch('/admin')

	const [ anchorEl, setAnchorEl ] = useState(null)
	const [ drawerOpen, setDrawerOpen ] = useState(false)

	useEffect(() => {
		setDrawerOpen(!isAdminRoot)
	}, [isAdminRoot])

	const handleMenu = event => {
		setAnchorEl(event.currentTarget)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	/**
	 * Update the main page heading when the theme changes
	 */
	useEffect(() => {
		data.menuHeading = theme?.title ? theme.title : data.defaultMenuHeading
	}, [theme])

	return (
		<AdminContainer className='AdminContainer'>
			<AppBar position="relative" open={ drawerOpen }>
				<Toolbar>
					<Logo size='mini' src='/img/BPLogo.svg' />
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
								vertical: 'top',
								horizontal: 'right',
							} }
							keepMounted
							transformOrigin={ {
								vertical: 'top',
								horizontal: 'right',
							} }
							open={ Boolean(anchorEl) }
							onClose={ handleMenuClose }
						>
							<Link to="/admin"><MenuItem>Themes List</MenuItem></Link>
							<Divider />
							<MenuItem onClick={ () => { handleMenuClose(); Meteor.logout(() => setLocation('/login')) } }>Sign Out</MenuItem>
						</Menu>
					</div>
				</Toolbar>
			</AppBar>

			<Drawer
				sx={ {
					width: drawerWidth,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box',
					},
				} }
				variant="persistent"
				anchor="left"
				open={ drawerOpen }
			>
				<DrawerHeader>
					<Button component={ Link } color="warning" to={ themeLoading ? '#' : `/admin/${theme._id}/presentation` } fullWidth sx={ { p: 2 } }><BarChartIcon />Presentation</Button>
				</DrawerHeader>

				<Divider />

				<AdminLinks activeMenuItem={ page ?? '' } />
			</Drawer>

			<Main open={ drawerOpen }>
				<Container>
					<Grid container>

						<Outlet />

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
	shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }: { theme: Theme, open: boolean }) => ({
	transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: `${drawerWidth}px`,
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}))

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
	({ theme, open }: { theme: Theme, open: boolean }) => ({
		flexGrow: 1,
		padding: theme.spacing(3),
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: 'auto',
		...(open && {
			transition: theme.transitions.create('margin', {
				easing: theme.transitions.easing.easeOut,
				duration: theme.transitions.duration.enteringScreen,
			}),
			marginLeft: `${drawerWidth}px`,
		}),
	}),
)

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'flex-end',
}))

export default AdminLayout

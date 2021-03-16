import { Meteor } from 'meteor/meteor'
import React, { useState, useEffect } from 'react'

import { Route, Switch, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import LoadingRoute from '/imports/ui/Routes/LoadingRoute'

import ThemesList from '/imports/ui/Welcome/ThemesList'
import Admin from '/imports/ui/Admin'
import {
	Loader,
	Container,
	Dropdown,
	Grid,
	Header,
	Icon,
	Image,
	Menu
} from 'semantic-ui-react'
import { Media } from '/imports/ui/MediaProvider'
import Sidebar from './Sidebar'
import AdminLinks from './AdminLinks'
import styled from 'styled-components'

import { observer } from 'mobx-react-lite'
import { useData, useTheme } from '/imports/api/providers'
import layoutTheme from '/imports/ui/theme'

const AdminLayout = observer(() => {
	const history = useHistory()
	const location = useLocation()
	const match = useRouteMatch('/admin/:id/:page')

	const [ sidebarVisible, setSidebarVisible ] = useState(false)

	const data = useData()
	const { theme } = useTheme()

	const setSidebarVisibilty = () => {
		let showSidebar = window.innerWidth >= layoutTheme.screen.tablet && !/^\/(admin|themes)[/]?$/.test(location.pathname)
		setSidebarVisible(showSidebar)
	}

	useEffect(() => {
		setSidebarVisibilty()
	}, [ location.pathname ])

	useEffect(() => {
		window.addEventListener('resize', setSidebarVisibilty)
		return () => window.removeEventListener('resize', setSidebarVisibilty)
	})

	/**
	 * Update the main page heading when the theme changes
	 */
	useEffect(() => {
		data.menuHeading = theme ? theme.title : data.defaultMenuHeading
	}, [theme])

	return(
		<AdminContainer className='AdminContainer'>
			<TopbarMenu borderless className={ `Menu ${sidebarVisible && 'offset'}` }>
				<Menu.Item>
					<Media greaterThanOrEqual="tablet">
						<Logo
							size='mini'
							src='/img/BPLogo.svg'
						/>
					</Media>
					{ !['/themes', '/admin'].includes(location.pathname) && <Media lessThan="tablet">
						<Icon
							name='bars'
							link
							onClick={ () => setSidebarVisible(!sidebarVisible) }
						/>
					</Media> }
				</Menu.Item>

				<Menu.Item header style={ { paddingLeft: 0 } }>{ data.menuHeading }</Menu.Item>

				<Menu.Menu position='left'>
					<Dropdown text='Menu' className='link item'>
						<Dropdown.Menu>
							<Dropdown.Item onClick={ () => history.push('/admin') } >Themes List</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item onClick={ () =>  Meteor.logout(() => history.push('/login')) } ><Icon name='sign-out' color='black'/>Sign Out</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</Menu.Menu>
			</TopbarMenu>

			<Sidebar visible={ sidebarVisible }>
				<SidebarMenu>
					{/* Menu */}
					<Header as={ 'h1' } style={ { height: '51px' } }>Menu</Header>

					<AdminLinks activeMenuItem={ match?.params?.page || '' } />

				</SidebarMenu>
			</Sidebar>

			<OffsetContainer className={ sidebarVisible && 'offset' }>
				<Container className='Container'>
					<Grid columns={ 16 } className='Grid'>
						<Switch>
							<LoadingRoute exact path={ ['/themes', '/admin'] } render={ () => <ThemesList /> } />
							<LoadingRoute path='/admin/:id' component={ Admin } />
						</Switch>
					</Grid>
				</Container>
			</OffsetContainer>

		</AdminContainer>
	)
})

const AdminContainer = styled.div`
	background: #2b4a7c;
	width: 100%;
	min-height: 100%;
	padding-bottom: 15px;

	.sidebar .ui.header {
		text-align: center;
		padding-top: 10px;
	}
`

const OffsetContainer = styled.div`
	width: 100%;
	min-height: 100%;
	padding-top: calc(1em + 61px);
	transition: padding 0.25s ease-in-out;
	padding-bottom: 15px;

	&.offset {
		@media screen and (min-width: ${ ({ theme }) => theme.screen.tablet }px) {
			padding-left: 150px;
		}
	}
`

const TopbarMenu = styled(Menu)`
	position: absolute;
	width: 100%;
	height: 61px;
	margin: 0;
	padding-left: 0;
	transition: padding 0.25s ease-in-out;

	@media screen and (max-width: ${ ({ theme }) => theme.screen.tablet }px) {
		position: fixed;
		z-index: 999;
	}

	&& {
		border-radius: 0;
	}

	&.offset {
		padding-left: 150px;
	}
`

const SidebarMenu = styled.div`
	width: inherit !important;
	backface-visibility: hidden;
	transition: none;
	will-change: transform;
	transform: translate3d(0, 0, 0);
	-webkit-overflow-scrolling: touch;
	height: 100% !important;
	max-height: 100%;
	border-radius: 0em !important;
	margin: 0em !important;
	overflow-y: auto !important;
	z-index: 102;
	background: white;

	& .ui.header {
    text-align: center;
    padding-top: 10px;
	}
`

const Logo = styled(Image)`
	filter: invert(100%);
`

export default AdminLayout

import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
// import PrivateRoute from '/imports/ui/Components/PrivateRoute';
import PropTypes from 'prop-types';
// import { useTheme } from '/imports/stores/AppContext';
import ThemesList from '/imports/ui/Welcome/ThemesList';
import Admin from '/imports/ui/Admin';
import {
	Loader,
	Container,
	Dropdown,
	Grid,
	Header,
	Icon,
	Image,
	Menu
} from 'semantic-ui-react';
import Sidebar from '/imports/ui/Components/Sidebar';
import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

const AdminContainer = styled.div`
	background: #2b4a7c;
	width: 100%;
	min-height: 100%;

	.sidebar .ui.header {
		text-align: center;
		padding-top: 10px;
	}
`;

const OffsetContainer = styled.div`
	width: 100%;
	min-height: 100%;
	padding-top: 1em;
	transition: padding 0.25s ease-in-out;

	&.offset {
		padding-left: 150px;
	}
`;

const TopbarMenu = styled(Menu)`
	margin: 0;
	padding-left: 150px;
	height: 61px;

	&& {
		border-radius: 0;
	}
`;

const SidebarMenu = styled(Menu)`
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

	& .ui.header {
    text-align: center;
    padding-top: 10px;
	}
`;

const MenuLink = withRouter(props => {
	const handleNav = () => {
		if(props.target && props.target === '_blank') {
			window.open(props.to);
		} else {
			props.history.push(props.to);
		}
	};

	return (
		<Menu.Item as='a' to={ props.to } onClick={ handleNav }>{ props.children }</Menu.Item>
	);
});

const AdminLayoutNew = withRouter(observer(props => {
	const [ sidebarVisible, setSidebarVisible ] = useState(false);

	const data = useData();

	useEffect(() => {
		// Hide sidebar on themes list, show when them is chosen
		let showSidebar = true;
		const regex = {
			admin: /^\/admin[/]?$/,
			themes: /^\/themes[/]?$/,
		};

		if(regex.admin.test(props.location.pathname) || regex.themes.test(props.location.pathname)) {
			showSidebar = false;
		}
		setSidebarVisible(showSidebar);
	}, [ props.location.pathname ]);

	const loading = data.loading;
	
	return(
		<AdminContainer className='AdminContainer'>
			
			<TopbarMenu borderless className='Menu'>
				<Menu.Item>
					<Image size='mini' src='/img/BPLogo.svg' style={ { filter: 'invert(100%)' } } />
				</Menu.Item>
				<Menu.Item header>{ data.menuHeading } { props.match.params.id && props.match.params.id }</Menu.Item>

				<Menu.Menu position='right'>
					<Dropdown text='Menu' className='link item'>
						<Dropdown.Menu>
							<Dropdown.Item onClick={ () => props.history.push('/admin') } >Themes List</Dropdown.Item>
							<Dropdown.Divider />
							<Dropdown.Item onClick={ () =>  Meteor.logout(() => props.history.push('/login')) } ><Icon name='sign-out' color='black'/>Sign Out</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</Menu.Menu>
			</TopbarMenu>

			<Sidebar className='Sidebar'
				visible={ sidebarVisible }
			>
				<SidebarMenu vertical>
					<Header as={ 'h1' }>Menu</Header>
					<MenuLink to={ `/admin/${data.themeId}/settings` }>Settings</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/orgs` }>Orgs</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/members` }>Members</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/chits` }>Chit Votes</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/allocation` }>Allocations</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/leverage` }>Leverage</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/presentation` }>Presentation</MenuLink>

					<Header as={ 'h1' }>Pages</Header>
					<MenuLink to={ `/presentation/${data.themeId}` } target='_blank'>Presentation</MenuLink>
					<Menu.Item as={ 'a' }>Kiosk</Menu.Item>
					<Menu.Item as={ 'a' }>Feedback</Menu.Item>
				</SidebarMenu>
			</Sidebar>

			<OffsetContainer className={ sidebarVisible && 'offset' }>
				<Container className='Container'>
					<Grid columns={ 16 } className='Grid'>
						<Switch>
							<Route exact path={ ['/themes', '/admin'] } render={ matchProps => {
								data.themeId = undefined;
								return <ThemesList />;
							} } />
							<Route path='/admin/:id' render={ matchProps => {
								data.themeId = matchProps.match.params.id;
								if(loading) return <Loader active />;
								return <Admin />;
							} } />
						</Switch>
					</Grid>
				</Container>
			</OffsetContainer>

		</AdminContainer>
	);
}));

MenuLink.propTypes = {
	children: PropTypes.any,
	as: PropTypes.string,
	to: PropTypes.string,
	target: PropTypes.any
};

AdminLayoutNew.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	]),
	history: PropTypes.object,
	location: PropTypes.object,
	match: PropTypes.object
};

export default AdminLayoutNew;
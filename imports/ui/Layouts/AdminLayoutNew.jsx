import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
// import PrivateRoute from '/imports/ui/Components/PrivateRoute';
// import { AppProvider } from '/imports/context';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';
// import { useTheme } from '/imports/stores/AppContext';
import ThemesList from '/imports/ui/Welcome/ThemesList';
import Admin from '/imports/ui/Admin';
import {
	Loader,
	Container,
	Divider,
	Dropdown,
	Grid,
	Header,
	Icon,
	Image,
	List,
	Menu,
	Segment,
	Visibility,
	Sidebar
} from 'semantic-ui-react';
import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
// import { useApp } from '/imports/stores/AppProvider';
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
		if(props.location.pathname === '/admin' || props.location.pathname === '/admin/') {
			showSidebar = false;
		}
		setSidebarVisible(showSidebar);
	}, [ props.location.pathname ]);

	console.log({ loading: data.loading });

	return(
		<AdminContainer>

			{/* Sidebar encapsulates page to allow overlay on top bar menu */}
			<Sidebar.Pushable style={ { minWidth: '100%', minHeight: '100vh' } }>

				<Sidebar 
					as={ Menu }
					vertical
					visible={ sidebarVisible }
					width='thin'
					animation='overlay'
				>
					<Header as={ 'h1' }>Menu</Header>
					<MenuLink to={ `/admin/${data.themeId}/orgs` }>Orgs</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/members` }>Members</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/chits` }>Chit Votes</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/allocation` }>Allocations</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/leverage` }>Leverage</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/presentation` }>Presentation</MenuLink>
					<MenuLink to={ `/admin/${data.themeId}/settings` }>Settings</MenuLink>

					<Header as={ 'h1' }>Pages</Header>
					<MenuLink to={ `/presentation/${data.themeId}` } target='_blank'>Presentation</MenuLink>
					<Menu.Item as={ 'a' }>Kiosk</Menu.Item>
					<Menu.Item as={ 'a' }>Feedback</Menu.Item>

				</Sidebar>

				<Menu borderless style={ { margin: 0, borderRadius: 0 } }>
					<Container>
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
					</Container>
				</Menu>

				<OffsetContainer className={ sidebarVisible && 'offset' }>
					<Container>
						<Grid columns={ 16 }>
							<Switch>
								<Route exact path={ ['/themes', '/admin'] } render={ matchProps => {
									data.themeId = undefined;
									return <ThemesList />;
								} } />
								<Route path='/admin/:id' render={ matchProps => {
									data.themeId = matchProps.match.params.id;
									if(data.loading) return <Loader active />;
									return <Admin />;
								} } />
							</Switch>
						</Grid>
					</Container>
				</OffsetContainer>
			</Sidebar.Pushable>
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
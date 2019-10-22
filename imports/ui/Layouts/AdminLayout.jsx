import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import { Route, withRouter, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
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
	Menu,
	Responsive
} from 'semantic-ui-react';
import Sidebar from '/imports/ui/Components/Sidebar';
import styled from 'styled-components';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

const AdminContainer = styled.div`
	background: #2b4a7c;
	width: 100%;
	min-height: 100%;
	padding-bottom: 15px;

	.sidebar .ui.header {
		text-align: center;
		padding-top: 10px;
	}
`;

const OffsetContainer = styled.div`
	width: 100%;
	min-height: 100%;
	padding-top: calc(1em + 61px);
	transition: padding 0.25s ease-in-out;
	padding-bottom: 15px;

	&.offset {
		@media screen and (min-width: ${ ({ theme }) => theme.media.onlyTablet.minWidth }px) {
			padding-left: 150px;
		}
	}
`;

const TopbarMenu = styled(Menu)`
	position: absolute;
	width: 100%;
	height: 61px;
	margin: 0;
	padding-left: 0;
	transition: padding 0.25s ease-in-out;

	@media screen and (max-width: ${ ({ theme }) => theme.media.onlyTablet.minWidth }px) {
		position: fixed;
		z-index: 999;
	}

	&& {
		border-radius: 0;
	}

	&.offset {
		padding-left: 150px;
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

const Logo = styled(Image)`
	filter: invert(100%);
`;

const MenuLink = withRouter(({ target, to, history, children, active }) => {
	const handleNav = () => {
		if(target && target === '_blank') {
			window.open(to);
		} else {
			history.push(to);
		}
	};

	return (
		<Menu.Item as='a' to={ to } onClick={ handleNav } active={ active && active }>{ children }</Menu.Item>
	);
});

const AdminLayout = withRouter(observer(props => {
	const [ sidebarVisible, setSidebarVisible ] = useState(false);
	const [ documentWidth, setDocumentWidth ] = useState();
	const [ activeMenuItem, setActiveMenuItem ] = useState();

	const data = useData();

	useEffect(() => {
		if(documentWidth >= Responsive.onlyTablet.minWidth) {
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
		} else {
			if(data.theme) data.menuHeading = data.theme.title;
			setSidebarVisible(false);
		}
	}, [ props.location.pathname, documentWidth ]);

	useEffect(() => {
		setActiveMenuItem();
	}, []);

	const handleOnUpdate = (e, { width }) => {
		setDocumentWidth(width);
	};

	const setActivePage = matchProps => {
		const url = matchProps.location.pathname;
		const filter = matchProps.match.url;
		const page = url.substring(url.indexOf(filter) + filter.length + 1);
		setActiveMenuItem(page);
	};

	const loading = data.loading;

	return(
		<AdminContainer className='AdminContainer'>
			
			<TopbarMenu borderless className={ `Menu ${sidebarVisible && 'offset'}` }>
				<Menu.Item>
					<Responsive
						minWidth={ Responsive.onlyTablet.minWidth }
						as={ Logo } 
						size='mini' 
						src='/img/BPLogo.svg'
					/>
					<Responsive
						maxWidth={ Responsive.onlyTablet.minWidth }
						as={ Icon }
						name='bars'
						link
						onClick={ () => setSidebarVisible(!sidebarVisible) }
					/>
				</Menu.Item>

				<Menu.Item header style={ { paddingLeft: 0 } }>{ data.menuHeading }</Menu.Item>

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

			<Responsive 
				as={ Sidebar } 
				className='Sidebar'
				visible={ sidebarVisible }
				fireOnMount
				onUpdate={ handleOnUpdate }
			>
				<SidebarMenu vertical>
					<Header as={ 'h1' }>Menu</Header>
					<MenuLink 
						to={ `/admin/${data.themeId}/settings` }
						active={ activeMenuItem === 'settings' }
					>
						Settings
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/orgs` }
						active={ activeMenuItem === 'orgs' }
					>
						Orgs
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/members` }
						active={ activeMenuItem === 'members' }
					>
						Members
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/chits` }
						active={ activeMenuItem === 'chits' }
					>
						Chit Votes
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/allocation` }
						active={ activeMenuItem === 'allocation' }
					>
						Allocations
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/leverage` }
						active={ activeMenuItem === 'leverage' }
					>
						Leverage
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/presentation` }
						active={ activeMenuItem === 'presentation' }
					>
						Presentation
					</MenuLink>

					<Header as={ 'h1' }>Pages</Header>
					<MenuLink to={ `/presentation/${data.themeId}` } target='_blank'>Presentation</MenuLink>
					<MenuLink to={ `/kiosk/${data.themeId}` }>Kiosk</MenuLink>
					<Menu.Item as={ 'a' }>Feedback</Menu.Item>
				</SidebarMenu>
			</Responsive>

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
								setActivePage(matchProps);

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
	target: PropTypes.any,
	active: PropTypes.string
};

AdminLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	]),
	history: PropTypes.object,
	location: PropTypes.object,
	match: PropTypes.object
};

export default AdminLayout;
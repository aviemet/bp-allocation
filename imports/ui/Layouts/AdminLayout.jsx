import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Route, withRouter, Switch } from 'react-router-dom';

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
import { useData, useTheme } from '/imports/api/providers';

const AdminLayout = withRouter(observer(props => {
	const [ sidebarVisible, setSidebarVisible ] = useState(false);
	const [ documentWidth, setDocumentWidth ] = useState();
	const [ activeMenuItem, setActiveMenuItem ] = useState();

	const data = useData();

	const { theme, isLoading } = useTheme();

	useEffect(() => {
		if(documentWidth >= Responsive.onlyTablet.minWidth) {
			// Hide sidebar on themes list, show when theme is chosen
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
			if(theme) data.menuHeading = theme.title;
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
					{/* Menu */}
					<Header as={ 'h1' }>Menu</Header>

					<MenuLink
						to={ `/admin/${data.themeId}/settings` }
						active={ activeMenuItem === 'settings' }
						iconPosition='left'
					>
						<Icon name='setting'/> Settings
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/orgs` }
						active={ activeMenuItem === 'orgs' }
						iconPosition='left'
					>
						<Icon name='building' /> Orgs
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/members` }
						active={ activeMenuItem === 'members' }
						iconPosition='left'
					>
						<Icon name='users' /> Members
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/chits` }
						active={ activeMenuItem === 'chits' }
						iconPosition='left'
					>
						<Icon name='star' /> Chit Votes
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/allocation` }
						active={ activeMenuItem === 'allocation' }
						iconPosition='left'
					>
						<Icon name='dollar' /> Allocations
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/leverage` }
						active={ activeMenuItem === 'leverage' }
						iconPosition='left'
					>
						<Icon name='chart pie' /> Leverage
					</MenuLink>

					<MenuLink 
						to={ `/admin/${data.themeId}/presentation` }
						active={ activeMenuItem === 'presentation' }
						iconPosition='left'
					>
						<Icon name='chart bar' /> Presentation
					</MenuLink>

					{/* Pages */}
					<Header as={ 'h1' }>Pages</Header>

					<MenuLink to={ `/kiosk/${data.themeId}` }>
						Kiosk
					</MenuLink>

					<MenuLink to={ `/feedback/${data.themeId}` }>
						Feedback
					</MenuLink>

					<MenuLink to={ `/presentation/${data.themeId}` } target='_blank'>
						Presentation
					</MenuLink>

					<MenuLink to={ `/pledges/${data.themeId}` } target='_blank'>
						Pledge Inputs
					</MenuLink>

				</SidebarMenu>
			</Responsive>

			<OffsetContainer className={ sidebarVisible && 'offset' }>
				<Container className='Container'>
					<Grid columns={ 16 } className='Grid'>
						<Switch>
							{/**
							 * This is where the themeId gets set for the application
							 */}
							<Route exact path={ ['/themes', '/admin'] } render={ matchProps => {
								data.themeId = undefined;
								return <ThemesList />;
							} } />
							<Route path='/admin/:id' render={ matchProps => {
								data.themeId = matchProps.match.params.id;
								setActivePage(matchProps);

								if(isLoading) return <Loader active />;
								return <Admin />;
							} } />
						</Switch>
					</Grid>
				</Container>
			</OffsetContainer>

		</AdminContainer>
	);
}));

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

/**
 * MenuLink for Vertical Admin Menu
 */
const MenuLink = withRouter(({ target, to, history, children, active, iconPosition, className, id }) => {
	const handleNav = () => {
		if(target && target === '_blank') {
			window.open(to);
		} else {
			history.push(to);
		}
	};

	let classes = className || '';
	if(iconPosition && iconPosition !== 'right') {
		classes += iconPosition;
	}

	return (
		<MenuItem 
			as='a' 
			to={ to } 
			onClick={ handleNav } 
			active={ active && active }
			className={ classes }
			id={ id ? id : '' }
		>
			{ target === '_blank' && <Icon name='external' size='small' /> }{ children }
		</MenuItem>
	);
});

MenuLink.propTypes = {
	children: PropTypes.any,
	as: PropTypes.string,
	to: PropTypes.string,
	target: PropTypes.any,
	active: PropTypes.bool,
	iconPosition: PropTypes.oneOf(['left', 'right']),
	className: PropTypes.string,
	id: PropTypes.string
};

const MenuItem = styled(Menu.Item)`
	&&&.left {
		i.icon {
			float: left;
			margin: 0 0.5em 0 0;
		}
	}
`;
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
import AdminLinks from './AdminLinks';

import { observer } from 'mobx-react-lite';
import { useData, useTheme } from '/imports/api/providers';

const AdminLayout = withRouter(observer(props => {
	const [ sidebarVisible, setSidebarVisible ] = useState(false);
	const [ documentWidth, setDocumentWidth ] = useState();
	const [ activeMenuItem, setActiveMenuItem ] = useState();

	const data = useData();

	const { theme, isLoading: themeLoading } = useTheme();

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
			setSidebarVisible(false);
		}
	}, [ props.location.pathname, documentWidth ]);

	useEffect(() => {
		data.menuHeading = theme ? theme.title : data.defaultMenuHeading;
	}, [theme]);

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
				<SidebarMenu>
					{/* Menu */}
					<Header as={ 'h1' } style={ { height: '51px' } }>Menu</Header>

					<AdminLinks activeMenuItem={ activeMenuItem } />

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

								if(themeLoading) return <Loader active />;
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
import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
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
} from 'semantic-ui-react'
import styled from 'styled-components';

const AdminContainer = styled.div`
	background: #2b4a7c;
	width: 100%;
	min-height: 100%;
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

const AdminLayout = props => {
	const [ sidebarVisible, setSidebarVisible ] = useState(false);

	useEffect(() => {
		console.log({ location: props.location });
		if(props.location.pathname !== '/themes') {
			setSidebarVisible(true);
		} else {
			setSidebarVisible(false);
		}
	}, [ props.location ]);

	return(
		<AdminContainer>

			<Menu borderless style={ { marginBottom: 0, borderRadius: 0 } }>
				<Container>
					<Menu.Item>
						<Image size='mini' src='/img/BPLogo.svg' style={ { filter: 'invert(100%)' } } />
					</Menu.Item>
					<Menu.Item header>Battery Powered Allocation Night Themes</Menu.Item>

					<Menu.Menu position='right'>
						<Dropdown text='Menu' className='link item'>
							<Dropdown.Menu>
								<Dropdown.Item onClick={ () => props.history.push('/themes') } >Themes List</Dropdown.Item>
								<Dropdown.Divider />
								<Dropdown.Item onClick={ () =>  Meteor.logout(() => props.history.push('/login')) } ><Icon name='sign-out' color='black'/>Sign Out</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</Menu.Menu>
				</Container>
			</Menu>

			<Sidebar.Pushable style={ { minWidth: '100%', minHeight: '100vh' } }>
				<Sidebar 
					as={ Menu }
					vertical
					visible={ sidebarVisible }
					width='thin'
					animation='overlay'
				>
					<Header as={ 'h1' }>Menu</Header>
					<Menu.Item as={ 'a' }>Orgs</Menu.Item>
					<Menu.Item as={ 'a' }>Members</Menu.Item>
					<Menu.Item as={ 'a' }>Chit Votes</Menu.Item>
					<Menu.Item as={ 'a' }>Allocations</Menu.Item>
					<Menu.Item as={ 'a' }>Leverage</Menu.Item>
					<Menu.Item as={ 'a' }>Presentation</Menu.Item>

					<Header as={ 'h1' }>Pages</Header>
					<Menu.Item as={ 'a' }>Presentation</Menu.Item>
					<Menu.Item as={ 'a' }>Kiosk</Menu.Item>
					<Menu.Item as={ 'a' }>Feedback</Menu.Item>
				</Sidebar>

				<OffsetContainer className={ sidebarVisible && 'offset' }>
					<Container>
						<Grid columns={ 16 }>
							{props.children}
						</Grid>
					</Container>
				</OffsetContainer>
			</Sidebar.Pushable>
		</AdminContainer>
	);
};

AdminLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	]),
	history: PropTypes.object,
	location: PropTypes.object
};

export default withRouter(AdminLayout);
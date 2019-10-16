import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Grid } from 'semantic-ui-react'

const Login = ({ history, location }) => {
	
	const handleLogin = e => {
		Meteor.loginWithGoogle({
			loginStyle: 'popup',
			scope: [ 'email' ]
		}, err => {
			if(err) {
				console.error({ err });
			} else {
				let redirect = location.state && location.state.from ? location.state.from : '/';
				history.push(redirect);
			}
		});
	};

	return (
		<Grid textAlign='center' verticalAlign='middle'>
			<Grid.Column style={ { maxWidth: 450 } }>
				<img style={ { textAlign: 'center' } } src='/img/BPLogo.svg' />
				<h1>Battery Powered<br/>Allocation Night</h1>
				<Button 
					fluid 
					size='large' 
					onClick={ handleLogin }
				>
					Login
				</Button>
			</Grid.Column>
		</Grid>
	);
};

Login.propTypes = {
	history: PropTypes.object,
	location: PropTypes.object
};

export default withRouter(Login);
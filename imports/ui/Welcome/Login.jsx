import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Grid } from 'semantic-ui-react'
import CustomMessage from '../Components/CustomMessage';

const Login = ({ history, location }) => {
	
	const [ loginErrorVisible, setLoginErrorVisible ] = useState(false);

	const handleLogin = e => {
		Meteor.loginWithGoogle({
			loginStyle: 'popup',
			scope: [ 'email' ]
		}, err => {
			if(err) {
				showLoginError();
				console.error({ err });
			} else {
				let redirect = location.state && location.state.from ? location.state.from : '/';
				history.push(redirect);
			}
		});
	};

	const showLoginError = () => {
		setLoginErrorVisible(true);

		setTimeout(() => setLoginErrorVisible(false), 10000);
	};

	const hideMessage = () => setLoginErrorVisible(false);

	return (
		<>
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
			{ loginErrorVisible && <CustomMessage 
				negative 
				onDismiss={ hideMessage }
				heading='Login Unsuccesful'
				body={ <>
					<p>Authentication is restricted emails with the following domains:</p>
					<ul>
						{ ['thebatterysf.com'].map((domain, i) => ( // Should be pulling from the settings file, but I ain't got time for that
							<li key={ i }>{ domain }</li>
						)) }
					</ul>
				</> }
			/> }
		</>
	);
};

Login.propTypes = {
	history: PropTypes.object,
	location: PropTypes.object
};

export default withRouter(Login);
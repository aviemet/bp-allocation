import { Meteor } from 'meteor/meteor'
import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CustomMessage from '../Components/CustomMessage'

const Login = () => {
	const history = useHistory()
	const location = useLocation()

	const [loginErrorVisible, setLoginErrorVisible] = useState(false)

	const handleLogin = e => {
		Meteor.loginWithGoogle({
			loginStyle: 'popup',
			scope: [ 'email' ]
		}, err => {
			if(err) {
				showLoginError()
				console.error({ err })
			} else {
				let redirect = location.state && location.state.from ? location.state.from : '/'
				history.push(redirect)
			}
		})
	}

	const showLoginError = () => {
		setLoginErrorVisible(true)

		setTimeout(() => setLoginErrorVisible(false), 10000)
	}

	const hideMessage = () => setLoginErrorVisible(false)

	return (
		<>
			<Grid container justifyContent="center" alignItems="center">
				<Grid item xs={ 10 } sm={ 8 } md={ 6 } lg={ 4 } align="center">
					<img src='/img/BPLogo.svg' />
					<h1>Battery Powered<br/>Allocation Night</h1>
					<Button size='large' onClick={ handleLogin } style={ { width: '100%' } }>
						Login
					</Button>
				</Grid>
			</Grid>

			{ loginErrorVisible &&
				<CustomMessage
					negative
					onDismiss={ hideMessage }
					heading='Login Unsuccesful'
					body={ <>
						<p>Authentication is restricted to emails with the following domains:</p>
						<ul>
							{ ['thebatterysf.com'].map((domain, i) => ( // Should be pulling from the settings file
								<li key={ i }>{ domain }</li>
							)) }
						</ul>
					</> }
				/>
			}

		</>
	)
}

export default Login

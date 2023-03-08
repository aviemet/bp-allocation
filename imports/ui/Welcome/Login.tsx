import { Meteor } from 'meteor/meteor'
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Grid, Button } from '@mui/material'
import { useSnackbar } from 'notistack'

const Login = () => {
	const { enqueueSnackbar } = useSnackbar()

	const location = useLocation()
	const navigate = useNavigate()

	const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		Meteor.loginWithGoogle({
			loginStyle: 'popup',
			scope: ['email'],
		}, err => {
			if(err) {
				enqueueSnackbar(
					<>
						<p>Authentication is restricted to emails with the following domains:</p>
						<ul>
							{ ['thebatterysf.com'].map((domain, i) => ( // Should be pulling from the settings file
								<li key={ i }>{ domain }</li>
							)) }
						</ul>
					</>
					, { variant: 'error' })
				console.error({ err })
			} else {
				let redirect = location.state && location.state.from ? location.state.from : '/'
				navigate(redirect)
			}
		})
	}

	return (
		<Grid container justifyContent="center" alignItems="center">
			<Grid item xs={ 10 } sm={ 8 } md={ 6 } lg={ 4 } align="center">
				<img src='/img/BPLogo.svg' />
				<h1>Battery Powered<br/>Allocation Night</h1>
				<Button size='large' onClick={ handleLogin } style={ { width: '100%' } }>
						Login
				</Button>
			</Grid>
		</Grid>
	)
}

export default Login

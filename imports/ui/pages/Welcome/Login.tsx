import Button from "@mui/material/Button"
import Grid from "@mui/material/Grid"
import { useNavigate, useLocation } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"
import { useSnackbar } from "notistack"

const Login = () => {
	const { enqueueSnackbar } = useSnackbar()

	const navigate = useNavigate()
	const location = useLocation()

	const handleLogin = () => {
		Meteor.loginWithGoogle({
			loginStyle: "popup",
		}, err => {
			if(err) {
				enqueueSnackbar(
					<>
						<p>Authentication is restricted to emails with the following domains:</p>
						<ul>
							{ ["thebatterysf.com"].map((domain, i) => ( // Should be pulling from the settings file
								<li key={ i }>{ domain }</li>
							)) }
						</ul>
					</>
					, { variant: "error" })
				console.error({ err })
			} else {
				navigate({ to: "/admin" })
			}
		})
	}

	return (
		<>
			<Grid container justifyContent="center" alignItems="center">
				<Grid item xs={ 10 } sm={ 8 } md={ 6 } lg={ 4 } textAlign="center">
					<img src="/img/BPLogo.svg" alt="Battery Powered Logo" />
					<h1>Battery Powered<br/>Allocation Night</h1>
					<Button size="large" onClick={ handleLogin } style={ { width: "100%" } }>
						Login
					</Button>
				</Grid>
			</Grid>
		</>
	)
}

export default Login

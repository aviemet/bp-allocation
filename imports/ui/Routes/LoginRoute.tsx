import { Navigate } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"
import { WelcomeLayout } from "/imports/ui/Layouts"
import Login from "/imports/ui/Welcome/Login"

const LoginRoute = () => {
	if(Meteor.userId()) {
		return <Navigate to="/admin" />
	}

	return (
		<WelcomeLayout>
			<Login />
		</WelcomeLayout>
	)
}

export default LoginRoute

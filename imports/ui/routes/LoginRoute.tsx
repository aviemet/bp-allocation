import { createRoute, redirect } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"

import { WelcomeLayout } from "/imports/ui/layouts"
import { rootRoute } from "./rootRoute"
import Login from "../pages/Welcome/Login"


export const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	beforeLoad: () => {
		if(Meteor.userId()) {
			throw redirect({ to: "/admin" })
		}
	},
	component: () => {
		return (
			<WelcomeLayout>
				<Login />
			</WelcomeLayout>
		)
	},
})

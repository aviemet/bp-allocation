import { createRoute, redirect } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"

import { WelcomeLayout } from "/imports/ui/layouts"
import Login from "../pages/Welcome/Login"

import { rootRoute } from "."


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

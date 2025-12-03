import { createRouter, createRoute, RouterProvider, Navigate, redirect } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"

import { WelcomeLayout } from "/imports/ui/layouts"
import FourOhFour from "./404"
import { adminLayoutRoute, adminChildRoutes } from "./admin"
import { kioskRoute } from "./kiosk"
import { pledgesRoute } from "./pledges"
import { pledgesOverlayRoute } from "./pledgesOverlay"
import { presentationRoute, presentationPageRoute } from "./presentation"
import { rootRoute } from "./rootRoute"
import ShortRoute from "./ShortRoute"
import SimulationRoute from "./SimulationRoute"
import VotingRoute from "./VotingRoute"
import Login from "../pages/Welcome/Login"

const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	beforeLoad: () => {
		throw redirect({ to: "/admin" })
	},
})

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/login",
	component: () => {
		if(Meteor.userId()) {
			return <Navigate to="/admin" />
		}
		return (
			<WelcomeLayout>
				<Login />
			</WelcomeLayout>
		)
	},
})

const shortRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/v/$themeSlug/$memberCode",
	component: ShortRoute,
})

const votingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/voting/$id/$member",
	component: VotingRoute,
})

const simulationRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/simulation/$id",
	component: SimulationRoute,
})

const notFoundRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/404",
	component: FourOhFour,
})

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	adminLayoutRoute.addChildren(adminChildRoutes),
	presentationRoute.addChildren([presentationPageRoute]),
	shortRoute,
	votingRoute,
	kioskRoute,
	simulationRoute,
	pledgesRoute,
	pledgesOverlayRoute,
	notFoundRoute,
])

const router = createRouter({ routeTree })

const Routes = () => {
	return <RouterProvider router={ router } />
}

export default Routes

import { createRouter, createRoute, RouterProvider, Navigate, useParams, redirect } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"

import { WelcomeLayout } from "/imports/ui/layouts"
import FourOhFour from "./404"
import { adminLayoutRoute, adminChildRoutes } from "./admin"
import { kioskRoute } from "./kiosk"
import { pledgesRoute } from "./pledges"
import { presentationRoute } from "./presentation"
import { rootRoute } from "./rootRoute"
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

const ShortRouteComponent = () => {
	const { themeSlug, memberCode } = useParams({ from: "/v/$themeSlug/$memberCode" })
	return <div>Short route: { themeSlug } - { memberCode }</div>
}

const shortRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/v/$themeSlug/$memberCode",
	component: ShortRouteComponent,
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
	presentationRoute,
	shortRoute,
	votingRoute,
	kioskRoute,
	simulationRoute,
	pledgesRoute,
	notFoundRoute,
])

const router = createRouter({ routeTree })

const Routes = () => {
	return <RouterProvider router={ router } />
}

export default Routes

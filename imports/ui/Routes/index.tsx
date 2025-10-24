import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Navigate, useParams, redirect } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"
import React from "react"

import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout } from "/imports/ui/Layouts"
import Presentation from "/imports/ui/Presentation"
import Simulation from "/imports/ui/Admin/Simulation"
import Pledges from "/imports/ui/Pledges"
import Login from "/imports/ui/Welcome/Login"
import Kiosk from "/imports/ui/Kiosk"
import FourOhFour from "./404"

const rootRoute = createRootRoute({
	component: () => <Outlet />,
})

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

const adminRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin",
	component: () => {
		if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
			return <Navigate to="/login" />
		}
		return <AdminLayout />
	},
})

const adminWildcardRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin/*",
	component: () => {
		if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
			return <Navigate to="/login" />
		}
		return <AdminLayout />
	},
})

const adminIdRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin/$id",
	component: () => {
		if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
			return <Navigate to="/login" />
		}
		return <AdminLayout />
	},
})

const adminIdPageRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin/$id/$page",
	component: () => {
		if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
			return <Navigate to="/login" />
		}
		return <AdminLayout />
	},
})

const adminIdSettingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin/$id/settings",
	component: () => {
		if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
			return <Navigate to="/login" />
		}
		return <AdminLayout />
	},
})

const adminIdSettingsTabRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin/$id/settings/$activeTab",
	component: () => {
		if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
			return <Navigate to="/login" />
		}
		return <AdminLayout />
	},
})

const presentationRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/presentation/$id",
	component: () => {
		return (
			<PresentationLayout>
				<Presentation />
			</PresentationLayout>
		)
	},
})

const shortRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/v/$themeSlug/$memberCode",
	component: () => {
		const { themeSlug, memberCode } = useParams({ from: "/v/$themeSlug/$memberCode" })
		// Short route logic here
		return <div>Short route: { themeSlug } - { memberCode }</div>
	},
})

const votingRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/voting/$id/$member",
	component: () => {
		return (
			<KioskLayout>
				<Kiosk />
			</KioskLayout>
		)
	},
})

const kioskRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/kiosk/$id",
	component: () => {
		return (
			<KioskLayout>
				<Kiosk />
			</KioskLayout>
		)
	},
})

const simulationRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/simulation/$id",
	component: () => {
		return (
			<PresentationLayout>
				<Simulation />
			</PresentationLayout>
		)
	},
})

const pledgesRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/pledges/$id",
	component: () => {
		return (
			<KioskLayout>
				<Pledges />
			</KioskLayout>
		)
	},
})

const notFoundRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/404",
	component: FourOhFour,
})

const routeTree = rootRoute.addChildren([
	indexRoute,
	loginRoute,
	adminRoute,
	adminIdRoute,
	adminWildcardRoute,
	presentationRoute,
	shortRoute,
	votingRoute,
	kioskRoute,
	simulationRoute,
	pledgesRoute,
	adminIdPageRoute,
	adminIdSettingsRoute,
	adminIdSettingsTabRoute,
	notFoundRoute,
])

const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

const Routes = () => {
	return <RouterProvider router={ router } />
}

export default Routes

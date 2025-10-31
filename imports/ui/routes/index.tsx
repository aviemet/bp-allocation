import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, Navigate, useParams, redirect } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"

import { AdminLayout, WelcomeLayout, PresentationLayout, KioskLayout } from "/imports/ui/layouts"
import FourOhFour from "./404"
import {
	OrganizationsPane,
	OrganizationsEdit,
	OrganizationsImport,
	MembersPane,
	MembersImport,
	MembersEdit,
	SettingsPane,
	OverviewPane,
	MessagingPane,
	MessageEdit,
	ChitVotingPane,
	AllocationPane,
	PledgesPane,
	LeveragePane,
	PresentationPane,
} from "../pages/Admin/Panes"
import Simulation from "../pages/Admin/Simulation"
import ThemesList from "../pages/Admin/ThemesList"
import Kiosk from "../pages/Kiosk"
import Pledges from "../pages/Pledges"
import Presentation from "../pages/Presentation"
import Login from "../pages/Welcome/Login"

export const rootRoute = createRootRoute({
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

const adminLayoutRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin",
	beforeLoad: () => {
		if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
			throw redirect({ to: "/login" })
		}
	},
	component: () => <AdminLayout />,
})

const adminDefaultRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/",
	component: () => <ThemesList />,
})

const adminIdRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id",
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/admin/$id/presentation", params: { id: params.id } })
	},
})

const adminIdPresentationRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/presentation",
	component: () => <PresentationPane />,
})

const adminIdOrgsRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/orgs",
	component: () => <OrganizationsPane />,
})

const adminIdOrgsImportRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/orgs/import",
	component: () => <OrganizationsImport />,
})

const adminIdOrgsEditRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/orgs/$orgId",
	component: () => <OrganizationsEdit />,
})

const adminIdOrgsNewRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/orgs/new",
	component: () => <OrganizationsEdit />,
})

const adminIdMembersRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/members",
	component: () => <MembersPane />,
})

const adminIdMembersImportRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/members/import",
	component: () => <MembersImport />,
})

const adminIdMembersEditRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/members/$memberId",
	component: () => <MembersEdit />,
})

const adminIdMembersNewRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/members/new",
	component: () => <MembersEdit />,
})

const adminIdChitsRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/chits",
	component: () => <ChitVotingPane />,
})

const adminIdAllocationRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/allocation",
	component: () => <AllocationPane />,
})

const adminIdPledgesRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/pledges",
	component: () => <PledgesPane />,
})

const adminIdLeverageRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/leverage",
	component: () => <LeveragePane />,
})

const adminIdMessagingRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/messaging",
	component: () => <MessagingPane />,
})

const adminIdOverviewRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/overview",
	component: () => <OverviewPane />,
})

const adminIdSettingsRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/settings",
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/admin/$id/settings/$activeTab", params: { id: params.id, activeTab: "general" } })
	},
})

const adminIdSettingsTabRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/settings/$activeTab",
	component: () => <SettingsPane />,
})

const adminIdSettingsMessageNewRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/settings/messages/new/$type",
	component: () => <MessageEdit />,
})

const adminIdSettingsMessageEditRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/settings/messages/$messageId",
	component: () => <MessageEdit />,
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
	adminLayoutRoute.addChildren([
		adminDefaultRoute,
		adminIdRoute,
		adminIdPresentationRoute,
		adminIdOrgsRoute,
		adminIdOrgsImportRoute,
		adminIdOrgsEditRoute,
		adminIdOrgsNewRoute,
		adminIdMembersRoute,
		adminIdMembersImportRoute,
		adminIdMembersEditRoute,
		adminIdMembersNewRoute,
		adminIdChitsRoute,
		adminIdAllocationRoute,
		adminIdPledgesRoute,
		adminIdLeverageRoute,
		adminIdMessagingRoute,
		adminIdOverviewRoute,
		adminIdSettingsRoute,
		adminIdSettingsTabRoute,
		adminIdSettingsMessageNewRoute,
		adminIdSettingsMessageEditRoute,
	]),
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

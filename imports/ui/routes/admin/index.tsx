import { createRoute, redirect } from "@tanstack/react-router"
import { Meteor } from "meteor/meteor"

import { AdminLayout } from "/imports/ui/layouts"
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
} from "../../pages/Admin/Panes"
import ThemesList from "../../pages/Admin/ThemesList"
import { rootRoute } from "../rootRoute"

export const adminLayoutRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/admin",
	beforeLoad: () => {
		if(process.env.NODE_ENV !== "development" && !Meteor.userId()) {
			throw redirect({ to: "/login" })
		}
	},
	component: () => <AdminLayout />,
})

export const adminDefaultRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/",
	component: () => <ThemesList />,
})

export const adminIdRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id",
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/admin/$id/presentation", params: { id: params.id } })
	},
})

export const adminIdPresentationRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/presentation",
	component: () => <PresentationPane />,
})

export const adminIdOrgsRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/orgs",
	component: () => <OrganizationsPane />,
})

export const adminIdOrgsImportRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/orgs/import",
	component: () => <OrganizationsImport />,
})

export const adminIdOrgsEditRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/orgs/$orgId",
	component: () => <OrganizationsEdit />,
})

export const adminIdOrgsNewRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/orgs/new",
	component: () => <OrganizationsEdit />,
})

export const adminIdMembersRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/members",
	component: () => <MembersPane />,
})

export const adminIdMembersImportRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/members/import",
	component: () => <MembersImport />,
})

export const adminIdMembersEditRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/members/$memberId",
	component: () => <MembersEdit />,
})

export const adminIdMembersNewRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/members/new",
	component: () => <MembersEdit />,
})

export const adminIdChitsRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/chits",
	component: () => <ChitVotingPane />,
})

export const adminIdAllocationRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/allocation",
	component: () => <AllocationPane />,
})

export const adminIdPledgesRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/pledges",
	component: () => <PledgesPane />,
})

export const adminIdLeverageRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/leverage",
	component: () => <LeveragePane />,
})

export const adminIdMessagingRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/messaging",
	component: () => <MessagingPane />,
})

export const adminIdOverviewRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/overview",
	component: () => <OverviewPane />,
})

export const adminIdSettingsRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/settings",
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/admin/$id/settings/$activeTab", params: { id: params.id, activeTab: "general" } })
	},
})

export const adminIdSettingsTabRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/settings/$activeTab",
	component: () => <SettingsPane />,
})

export const adminIdSettingsMessageNewRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/settings/messages/new/$type",
	component: () => <MessageEdit />,
})

export const adminIdSettingsMessageEditRoute = createRoute({
	getParentRoute: () => adminLayoutRoute,
	path: "/$id/settings/messages/$messageId",
	component: () => <MessageEdit />,
})

export const adminChildRoutes = [
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
]


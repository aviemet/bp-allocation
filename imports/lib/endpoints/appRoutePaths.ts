import { PAGES } from "/imports/lib/presentation/global"

export const SETTINGS_TAB_SLUGS = ["general", "messages", "advanced", "logs"] as const

export const APP_ROUTE_PATH_TEMPLATES = [
	"/",
	"/login",
	"/admin",
	"/admin/$id",
	"/admin/$id/presentation",
	"/admin/$id/orgs",
	"/admin/$id/orgs/import",
	"/admin/$id/orgs/new",
	"/admin/$id/orgs/$orgId",
	"/admin/$id/members",
	"/admin/$id/members/import",
	"/admin/$id/members/new",
	"/admin/$id/members/$memberId",
	"/admin/$id/chits",
	"/admin/$id/allocation",
	"/admin/$id/pledges",
	"/admin/$id/leverage",
	"/admin/$id/messaging",
	"/admin/$id/overview",
	"/admin/$id/settings",
	"/admin/$id/settings/$activeTab",
	"/admin/$id/settings/messages/new/$type",
	"/admin/$id/settings/messages/$messageId",
	"/presentation/$id",
	"/presentation/$id/$currentPage",
	"/v/$themeSlug/$memberCode",
	"/voting/$id/$member",
	"/kiosk/$id",
	"/simulation/$id",
	"/pledges/$id",
	"/pledges-overlay/$id",
	"/pledges/inperson/$themeId",
	"/404",
] as const

export type AppRoutePathTemplate = (typeof APP_ROUTE_PATH_TEMPLATES)[number]

export interface AppRouteSmokeIds {
	themeId: string
	themeSlug: string
	orgId: string
	memberId: string
	memberCode: string
	messageId: string
	messageType: "text" | "email"
}

export const resolveAppRouteSmokePaths = (ids: AppRouteSmokeIds): string[] => {
	const themeBase = `/admin/${ids.themeId}`
	const settingsTabs = SETTINGS_TAB_SLUGS.map(tab => `${themeBase}/settings/${tab}`)
	const presentationPages = PAGES.map(page => `/presentation/${ids.themeId}/${page}`)

	return [
		"/",
		"/login",
		"/admin",
		themeBase,
		`${themeBase}/presentation`,
		`${themeBase}/orgs`,
		`${themeBase}/orgs/import`,
		`${themeBase}/orgs/new`,
		`${themeBase}/orgs/${ids.orgId}`,
		`${themeBase}/members`,
		`${themeBase}/members/import`,
		`${themeBase}/members/new`,
		`${themeBase}/members/${ids.memberId}`,
		`${themeBase}/chits`,
		`${themeBase}/allocation`,
		`${themeBase}/pledges`,
		`${themeBase}/leverage`,
		`${themeBase}/messaging`,
		`${themeBase}/overview`,
		`${themeBase}/settings`,
		...settingsTabs,
		`${themeBase}/settings/messages/new/${ids.messageType}`,
		`${themeBase}/settings/messages/${ids.messageId}`,
		`/presentation/${ids.themeId}`,
		...presentationPages,
		`/v/${ids.themeSlug}/${ids.memberCode}`,
		`/voting/${ids.themeId}/${ids.memberId}`,
		`/kiosk/${ids.themeId}`,
		`/simulation/${ids.themeId}`,
		`/pledges/${ids.themeId}`,
		`/pledges-overlay/${ids.themeId}`,
		`/pledges/inperson/${ids.themeId}`,
		"/404",
	]
}

export const REGISTERED_PUBLICATION_NAMES = [
	"memberThemes",
	"members",
	"member",
	"themes",
	"theme",
	"themeBySlug",
	"organizations",
	"organizations.pledgeFunding",
	"settings",
	"messages",
	"pledgeAnimationQueue",
	"logs.recent",
] as const

export const REGISTERED_METHOD_NAMES = [
	"organizations.create",
	"organizations.update",
	"organizations.remove",
	"organizations.removeMany",
	"organizations.pledge",
	"organizations.removePledge",
	"organizations.removePledgeById",
	"organizations.crowdFavorite",
	"organizations.reset",
	"organizations.saveLeverageSpread",
	"organizations.resetLeverage",
	"organizations.resetAllOrgFunds",
	"organizations.resetMessageStatus",
	"organizations.list",
	"themes.create",
	"themes.update",
	"themes.remove",
	"themes.lockTopOrg",
	"themes.saveOrg",
	"themes.unSaveOrg",
	"members.upsert",
	"members.removeMemberFromTheme",
	"members.removeAllMembers",
	"members.update",
	"members.updateTheme",
	"members.fundVote",
	"members.chitVote",
	"member.resetChitVotes",
	"member.resetFundsVotes",
	"members.remove",
	"members.list",
	"members.get",
	"messages.create",
	"message.update",
	"messages.remove",
	"settings.create",
	"settings.update",
	"pledgeAnimation.enqueue",
	"pledgeAnimation.markProcessed",
	"logs.purge",
	"images.remove",
	"images.removeMany",
	"images.rename",
	"textVotingLinkToMembers",
	"emailVotingLinkToMembers",
] as const

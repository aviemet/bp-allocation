import {
	aggregateVotesByOrganization,
	calculateVotesFromRawOrg,
	type OrgTransformerParams,
} from "/imports/server/transformers/orgTransformer"
import { computePledgeMatchingForPublication } from "/imports/lib/pledgeMatching"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import {
	Organizations,
	Themes,
	MemberThemes,
	PresentationSettings,
	type OrgData,
	type ThemeData,
	type SettingsData,
} from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

const computeMatching = (
	rawOrgs: OrgData[],
	theme: ThemeData,
	settings: SettingsData | undefined,
	memberThemes: MemberTheme[],
	chitVotesByOrg: Record<string, number>,
) => {
	const orgsWithVotes = rawOrgs.map(org => ({
		...org,
		votes: settings ? calculateVotesFromRawOrg(org, settings, theme, chitVotesByOrg) : 0,
	}))
	const preliminaryTopOrgs = filterTopOrgs(orgsWithVotes, theme)
	const topOrgIds = new Set(preliminaryTopOrgs.map(org => org._id))

	const matching = computePledgeMatchingForPublication(
		rawOrgs,
		topOrgIds,
		theme,
		settings?.useKioskFundsVoting || false,
		memberThemes,
	)

	return { topOrgIds, matchedAmounts: matching.matchedAmounts }
}

export type OrgPublicationFrame = {
	orgObserverParams: OrgTransformerParams
	initialOrgs: OrgData[]
	theme: ThemeData
	settings: SettingsData | undefined
}

export async function getOrgPublicationFrame(
	themeId: string,
	memberThemesOverride?: MemberTheme[],
): Promise<OrgPublicationFrame | null> {
	const theme = await Themes.findOneAsync({ _id: themeId })
	if(!theme) {
		return null
	}

	const settings = theme.presentationSettings ?
		await PresentationSettings.findOneAsync({ _id: theme.presentationSettings }) :
		undefined

	const memberThemes = memberThemesOverride ??
		await MemberThemes.find({ theme: themeId }).fetchAsync()

	const { fundsVotesByOrg, chitVotesByOrg } = aggregateVotesByOrganization(
		memberThemes,
		settings?.useKioskFundsVoting || false,
		settings?.useKioskChitVoting || false,
	)

	const initialOrgs = await Organizations.find({ theme: themeId }).fetchAsync()
	const initialMatching = computeMatching(initialOrgs, theme, settings, memberThemes, chitVotesByOrg)

	const orgObserverParams: OrgTransformerParams = {
		theme,
		settings,
		memberThemes,
		fundsVotesByOrg,
		chitVotesByOrg,
		topOrgIds: initialMatching.topOrgIds,
		matchedAmounts: initialMatching.matchedAmounts,
	}

	return { orgObserverParams, initialOrgs, theme, settings }
}

export function refreshOrgObserverParamsInPlace(
	orgObserverParams: OrgTransformerParams,
	allOrgs: OrgData[],
	theme: ThemeData,
	settings: SettingsData | undefined,
	memberThemes: MemberTheme[],
): void {
	const aggregated = aggregateVotesByOrganization(
		memberThemes,
		settings?.useKioskFundsVoting || false,
		settings?.useKioskChitVoting || false,
	)
	orgObserverParams.memberThemes = memberThemes
	orgObserverParams.fundsVotesByOrg = aggregated.fundsVotesByOrg
	orgObserverParams.chitVotesByOrg = aggregated.chitVotesByOrg
	const refreshedMatching = computeMatching(allOrgs, theme, settings, memberThemes, aggregated.chitVotesByOrg)
	orgObserverParams.topOrgIds = refreshedMatching.topOrgIds
	orgObserverParams.matchedAmounts = refreshedMatching.matchedAmounts
}

import { Random } from "meteor/random"

import { filterTopOrgs } from "/imports/lib/allocation/orgsMethods"
import { type ThemeData, type SettingsData, type OrgData, type MemberData } from "/imports/api/db"
import {
	OrgTransformer,
	aggregateVotesByOrganization,
	calculateVotesFromRawOrg,
} from "/imports/server/transformers/orgTransformer"
import { ThemeTransformer } from "/imports/server/transformers/themeTransformer"
import { MemberTransformer } from "/imports/server/transformers/memberTransformer"
import { computePledgeMatchingForPublication } from "/imports/lib/allocation/pledgeMatching"
import { type MemberTheme } from "/imports/types/schema"

export function resolveLoadTestScale(): number {
	const raw = Number.parseInt(process.env.LOAD_TEST_SCALE ?? "", 10)
	if(Number.isFinite(raw) && raw > 0) {
		return Math.min(raw, 5000)
	}
	return 80
}

export function resolveConcurrentMemberCount(): number {
	const raw = Number.parseInt(process.env.LOAD_TEST_CONCURRENT_MEMBERS ?? "", 10)
	if(Number.isFinite(raw) && raw > 0) {
		return Math.min(raw, 500)
	}
	return 40
}

export function resolveConcurrentRoundCount(): number {
	const raw = Number.parseInt(process.env.LOAD_TEST_CONCURRENT_ROUNDS ?? "", 10)
	if(Number.isFinite(raw) && raw > 0) {
		return Math.min(raw, 50)
	}
	return 8
}

export function buildSyntheticOrgDocuments(themeId: string, organizationCount: number): OrgData[] {
	const organizations: OrgData[] = []
	for(let index = 0; index < organizationCount; index++) {
		organizations.push({
			_id: Random.id(),
			theme: themeId,
			title: `Synthetic Org ${index}`,
			ask: 100000,
			amountFromVotes: 0,
			topOff: 0,
			pledges: [],
			leverageFunds: 0,
			createdAt: new Date(),
		})
	}
	return organizations
}

export function buildSyntheticMemberThemes(
	themeId: string,
	memberThemesCount: number,
	organizationIds: string[],
): MemberTheme[] {
	const memberThemes: MemberTheme[] = []
	const sliceLength = Math.min(organizationIds.length, 8)
	const organizationSlice = organizationIds.slice(0, sliceLength)

	for(let index = 0; index < memberThemesCount; index++) {
		const memberId = Random.id()
		const allocations = organizationSlice.map((organizationId, allocationIndex) => ({
			organization: organizationId,
			amount: ((index + allocationIndex) % 120) + 1,
			voteSource: "kiosk" as const,
			createdAt: new Date(),
		}))
		const chitVotes = organizationSlice.slice(0, Math.min(4, organizationSlice.length)).map((organizationId, voteIndex) => ({
			organization: organizationId,
			votes: ((index + voteIndex) % 12) + 1,
			voteSource: "kiosk" as const,
			createdAt: new Date(),
		}))
		memberThemes.push({
			_id: Random.id(),
			theme: themeId,
			member: memberId,
			chits: 10,
			amount: 5000,
			allocations,
			chitVotes,
			createdAt: new Date(),
		})
	}
	return memberThemes
}

export function buildSyntheticMemberDocuments(memberThemes: MemberTheme[]): MemberData[] {
	return memberThemes.map((memberTheme, index) => {
		const memberId = memberTheme.member
		if(!memberId) {
			throw new Error("Synthetic memberTheme missing member id")
		}
		return {
			_id: memberId,
			firstName: "Load",
			lastName: `Member${index}`,
			number: index,
			createdAt: new Date(),
		}
	})
}

export function baseThemeForSimulation(themeId: string, presentationSettingsId: string): ThemeData {
	return {
		_id: themeId,
		title: "Load simulation theme",
		presentationSettings: presentationSettingsId,
		organizations: [],
		numTopOrgs: 5,
		matchRatio: 2,
		leverageTotal: 500000,
		consolationActive: false,
		createdAt: new Date(),
	}
}

export function baseSettingsForSimulation(settingsId: string): SettingsData {
	return {
		_id: settingsId,
		useKioskFundsVoting: true,
		useKioskChitVoting: true,
	}
}

export function runThemePublicationPipeline(
	theme: ThemeData,
	settings: SettingsData,
	memberThemes: MemberTheme[],
	organizations: OrgData[],
): ReturnType<typeof ThemeTransformer> {
	const useKioskFundsVoting = settings.useKioskFundsVoting === true
	const useKioskChitVoting = settings.useKioskChitVoting === true
	const { fundsVotesByOrg, chitVotesByOrg } = aggregateVotesByOrganization(
		memberThemes,
		useKioskFundsVoting,
		useKioskChitVoting,
	)
	const orgsWithVotes = organizations.map(organization => ({
		...organization,
		votes: calculateVotesFromRawOrg(organization, settings, theme, chitVotesByOrg),
	}))
	const preliminaryTopOrganizations = filterTopOrgs(orgsWithVotes, theme)
	const topOrganizationIds = new Set(preliminaryTopOrganizations.map(organization => organization._id))
	const pledgeMatching = computePledgeMatchingForPublication(
		organizations,
		topOrganizationIds,
		theme,
		useKioskFundsVoting,
		memberThemes,
	)
	const transformedOrganizations = organizations.map(organization =>
		OrgTransformer(organization, {
			theme,
			settings,
			memberThemes,
			fundsVotesByOrg,
			chitVotesByOrg,
			topOrgIds: topOrganizationIds,
			matchedAmounts: pledgeMatching.matchedAmounts,
		}),
	)
	const topTransformedOrganizations = filterTopOrgs(transformedOrganizations, theme)
	return ThemeTransformer(theme, {
		topOrgs: topTransformedOrganizations,
		allOrgs: transformedOrganizations,
		memberThemes,
		settings,
		pledgeMatching,
	})
}

export function runOrganizationsPublicationPipeline(
	theme: ThemeData,
	settings: SettingsData,
	memberThemes: MemberTheme[],
	organizations: OrgData[],
): ReturnType<typeof OrgTransformer>[] {
	const useKioskFundsVoting = settings.useKioskFundsVoting === true
	const useKioskChitVoting = settings.useKioskChitVoting === true
	const { fundsVotesByOrg, chitVotesByOrg } = aggregateVotesByOrganization(
		memberThemes,
		useKioskFundsVoting,
		useKioskChitVoting,
	)
	const orgsWithVotes = organizations.map(organization => ({
		...organization,
		votes: calculateVotesFromRawOrg(organization, settings, theme, chitVotesByOrg),
	}))
	const preliminaryTopOrganizations = filterTopOrgs(orgsWithVotes, theme)
	const topOrganizationIds = new Set(preliminaryTopOrganizations.map(organization => organization._id))
	const pledgeMatching = computePledgeMatchingForPublication(
		organizations,
		topOrganizationIds,
		theme,
		useKioskFundsVoting,
		memberThemes,
	)
	return organizations.map(organization =>
		OrgTransformer(organization, {
			theme,
			settings,
			memberThemes,
			fundsVotesByOrg,
			chitVotesByOrg,
			topOrgIds: topOrganizationIds,
			matchedAmounts: pledgeMatching.matchedAmounts,
		}),
	)
}

export function runMembersPublicationPipelineNaive(
	members: MemberData[],
	memberThemes: MemberTheme[],
	themeId: string,
): ReturnType<typeof MemberTransformer>[] {
	return members.map(member =>
		MemberTransformer(
			member,
			memberThemes.find(
				row => row.member === member._id && row.theme === themeId,
			),
		),
	)
}

export function runMembersPublicationPipelineWithMemberThemeMap(
	members: MemberData[],
	memberThemeByMemberId: Map<string, MemberTheme>,
): ReturnType<typeof MemberTransformer>[] {
	return members.map(member =>
		MemberTransformer(member, memberThemeByMemberId.get(member._id)),
	)
}

export function simulateTriplePublicationRefresh(
	theme: ThemeData,
	settings: SettingsData,
	memberThemes: MemberTheme[],
	organizations: OrgData[],
	members: MemberData[],
): {
	themeComputed: ReturnType<typeof ThemeTransformer>
	organizationComputed: ReturnType<typeof OrgTransformer>[]
	membersNaive: ReturnType<typeof MemberTransformer>[]
} {
	const themeComputed = runThemePublicationPipeline(theme, settings, memberThemes, organizations)
	const organizationComputed = runOrganizationsPublicationPipeline(theme, settings, memberThemes, organizations)
	const membersNaive = runMembersPublicationPipelineNaive(members, memberThemes, theme._id)
	return {
		themeComputed,
		organizationComputed,
		membersNaive,
	}
}

import { Random } from "meteor/random"

import { filterTopOrgs } from "/imports/lib/allocation/orgsMethods"
import { type ThemeData, type SettingsData, type OrgData, type MemberData, MemberThemes } from "/imports/api/db"
import {
	OrgTransformer,
	aggregateVotesByOrganization,
	calculateVotesFromRawOrg,
} from "/imports/server/transformers/orgTransformer"
import { ThemeTransformer } from "/imports/server/transformers/themeTransformer"
import { MemberTransformer } from "/imports/server/transformers/memberTransformer"
import { computePledgeMatchingForPublication } from "/imports/lib/allocation/pledgeMatching"
import {
	findMemberThemeForMember,
	memberThemeContentSignature,
} from "/imports/server/publications/memberThemeChange"
import { registerMemberThemesRefreshListener } from "/imports/server/publications/memberThemesRefreshCoordinator"
import { createCoalescedRefresh } from "/imports/server/publications/publicationRefreshCoalesce"
import {
	formatPublicationRefreshMetrics,
	getPublicationRefreshMetrics,
	recordPublicationChangedEmissions,
	recordPublicationRefreshTrigger,
	resetPublicationRefreshMetrics,
	trackPublicationRefresh,
	type PublicationRefreshMetricsSnapshot,
} from "/imports/server/publications/publicationRefreshMetrics"
import { buildMemberThemeLookupMap } from "/imports/server/themeDataLoaders/memberThemeLookup"
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

export function resolveSubscriberCount(): number {
	const raw = Number.parseInt(process.env.LOAD_TEST_SUBSCRIBERS ?? "", 10)
	if(Number.isFinite(raw) && raw > 0) {
		return Math.min(raw, 500)
	}
	return 20
}

export function resolveLoadTestPrintMetrics(): boolean {
	const raw = process.env.LOAD_TEST_PRINT_METRICS
	if(raw === undefined || raw === "") {
		return true
	}
	return raw !== "0" && raw.toLowerCase() !== "false"
}

export function resolveLoadTestTimeCeilingMs(defaultMilliseconds: number = 90000): number {
	const ceilingMilliseconds = Number.parseInt(process.env.LOAD_TEST_TIME_CEILING_MS ?? "", 10)
	if(Number.isFinite(ceilingMilliseconds) && ceilingMilliseconds > 0) {
		return ceilingMilliseconds
	}
	return defaultMilliseconds
}

export function resolveSustainedWriteMilliseconds(): number {
	const raw = Number.parseInt(process.env.LOAD_TEST_SUSTAINED_MS ?? "", 10)
	if(Number.isFinite(raw) && raw >= 0) {
		return Math.min(raw, 60000)
	}
	return 0
}

const sleep = (milliseconds: number): Promise<void> =>
	new Promise(resolve => {
		setTimeout(resolve, milliseconds)
	})

export async function waitForPublicationRefreshIdle(options: {
	debounceMilliseconds?: number
	pollMilliseconds?: number
	timeoutMilliseconds?: number
} = {}): Promise<void> {
	const debounceMilliseconds = options.debounceMilliseconds ?? 150
	const pollMilliseconds = options.pollMilliseconds ?? 25
	const timeoutMilliseconds = options.timeoutMilliseconds ?? 120000
	await sleep(debounceMilliseconds)
	const deadline = Date.now() + timeoutMilliseconds
	while(Date.now() < deadline) {
		const snapshot = getPublicationRefreshMetrics()
		let inFlightTotal = 0
		for(const bucket of Object.values(snapshot.byName)) {
			inFlightTotal += bucket.inFlight
		}
		if(inFlightTotal === 0) {
			return
		}
		await sleep(pollMilliseconds)
	}
	throw new Error("Timed out waiting for publication refresh work to become idle")
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
		settings,
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
		settings,
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

export interface SubscriptionShapedStormContext {
	theme: ThemeData
	settings: SettingsData
	organizations: OrgData[]
	members: MemberData[]
	kioskMemberIds: string[]
	initialMemberThemes: MemberTheme[]
}

export interface SubscriptionShapedStormResult {
	writeCount: number
	subscriberCount: number
	listenerCount: number
	elapsedMilliseconds: number
	metrics: PublicationRefreshMetricsSnapshot
	metricsText: string
}

export function attachSubscriptionShapedListeners(
	themeId: string,
	context: SubscriptionShapedStormContext,
): () => void {
	const unsubscribers: Array<() => void> = []

	const themeCoalesced = createCoalescedRefresh()
	let pendingThemeRows: MemberTheme[] = []
	unsubscribers.push(registerMemberThemesRefreshListener(themeId, freshRows => {
		pendingThemeRows = freshRows
		themeCoalesced.schedule(async () => {
			recordPublicationRefreshTrigger("themes.refresh")
			await trackPublicationRefresh("themes.refresh", async () => {
				runThemePublicationPipeline(
					context.theme,
					context.settings,
					pendingThemeRows,
					context.organizations,
				)
				recordPublicationChangedEmissions("themes.refresh", 1)
			})
		})
	}))

	const organizationsCoalesced = createCoalescedRefresh()
	let pendingOrganizationsRows: MemberTheme[] = []
	unsubscribers.push(registerMemberThemesRefreshListener(themeId, freshRows => {
		pendingOrganizationsRows = freshRows
		organizationsCoalesced.schedule(async () => {
			recordPublicationRefreshTrigger("organizations.refresh")
			await trackPublicationRefresh("organizations.refresh", async () => {
				const transformed = runOrganizationsPublicationPipeline(
					context.theme,
					context.settings,
					pendingOrganizationsRows,
					context.organizations,
				)
				recordPublicationChangedEmissions("organizations.refresh", transformed.length)
			})
		})
	}))

	const pledgeFundingCoalesced = createCoalescedRefresh()
	let pendingPledgeFundingRows: MemberTheme[] = []
	unsubscribers.push(registerMemberThemesRefreshListener(themeId, freshRows => {
		pendingPledgeFundingRows = freshRows
		pledgeFundingCoalesced.schedule(async () => {
			recordPublicationRefreshTrigger("orgPledgeFunding.refresh")
			await trackPublicationRefresh("orgPledgeFunding.refresh", async () => {
				const transformed = runOrganizationsPublicationPipeline(
					context.theme,
					context.settings,
					pendingPledgeFundingRows,
					context.organizations,
				)
				recordPublicationChangedEmissions("orgPledgeFunding.refresh", transformed.length)
			})
		})
	}))

	const membersCoalesced = createCoalescedRefresh()
	let pendingMembersRows: MemberTheme[] = []
	unsubscribers.push(registerMemberThemesRefreshListener(themeId, freshRows => {
		pendingMembersRows = freshRows
		membersCoalesced.schedule(async () => {
			recordPublicationRefreshTrigger("members.refresh")
			await trackPublicationRefresh("members.refresh", async () => {
				const lookup = buildMemberThemeLookupMap(pendingMembersRows, themeId)
				runMembersPublicationPipelineWithMemberThemeMap(context.members, lookup)
				recordPublicationChangedEmissions("members.refresh", context.members.length)
			})
		})
	}))

	const membersById = new Map(context.members.map(member => [member._id, member]))
	for(const memberId of context.kioskMemberIds) {
		const member = membersById.get(memberId)
		if(!member) {
			continue
		}
		const memberCoalesced = createCoalescedRefresh()
		let pendingMemberRows: MemberTheme[] = context.initialMemberThemes
		let lastPublishedSignature = memberThemeContentSignature(
			findMemberThemeForMember(context.initialMemberThemes, memberId, themeId),
		)
		unsubscribers.push(registerMemberThemesRefreshListener(themeId, freshRows => {
			pendingMemberRows = freshRows
			const nextSignature = memberThemeContentSignature(
				findMemberThemeForMember(freshRows, memberId, themeId),
			)
			if(nextSignature === lastPublishedSignature) {
				return
			}
			memberCoalesced.schedule(async () => {
				recordPublicationRefreshTrigger("member.refresh")
				await trackPublicationRefresh("member.refresh", async () => {
					const memberTheme = findMemberThemeForMember(pendingMemberRows, memberId, themeId)
					const signature = memberThemeContentSignature(memberTheme)
					if(signature === lastPublishedSignature) {
						return
					}
					const lookup = buildMemberThemeLookupMap(memberTheme ? [memberTheme] : [], themeId)
					MemberTransformer(member, lookup.get(member._id))
					lastPublishedSignature = signature
					recordPublicationChangedEmissions("member.refresh", 1)
				})
			})
		}))
	}

	return () => {
		for(const unsubscribe of unsubscribers) {
			unsubscribe()
		}
	}
}

export async function runMemberThemesWriteBurst(
	memberThemeIds: string[],
	rounds: number,
): Promise<number> {
	let writeCount = 0
	for(let round = 0; round < rounds; round++) {
		const operations = memberThemeIds.map((memberThemeId, index) =>
			MemberThemes.updateAsync(
				{ _id: memberThemeId },
				{ $set: { chits: (round + index) % 15 } },
			),
		)
		await Promise.all(operations)
		writeCount += memberThemeIds.length
	}
	return writeCount
}

export async function runMemberThemesSustainedWriteStampede(
	memberThemeIds: string[],
	durationMilliseconds: number,
	batchPauseMilliseconds: number = 10,
): Promise<number> {
	let writeCount = 0
	let round = 0
	const deadline = Date.now() + durationMilliseconds
	while(Date.now() < deadline) {
		const operations = memberThemeIds.map((memberThemeId, index) =>
			MemberThemes.updateAsync(
				{ _id: memberThemeId },
				{ $set: { chits: (round + index) % 15 } },
			),
		)
		await Promise.all(operations)
		writeCount += memberThemeIds.length
		round += 1
		await sleep(batchPauseMilliseconds)
	}
	return writeCount
}

export async function runSubscriptionShapedRefreshStorm(options: {
	themeId: string
	context: SubscriptionShapedStormContext
	memberThemeIds: string[]
	rounds: number
	sustainedWriteMilliseconds?: number
}): Promise<SubscriptionShapedStormResult> {
	resetPublicationRefreshMetrics()
	const unsubscribe = attachSubscriptionShapedListeners(options.themeId, options.context)
	const startedAt = Date.now()
	let writeCount = 0
	try {
		writeCount += await runMemberThemesWriteBurst(options.memberThemeIds, options.rounds)
		if(options.sustainedWriteMilliseconds && options.sustainedWriteMilliseconds > 0) {
			writeCount += await runMemberThemesSustainedWriteStampede(
				options.memberThemeIds,
				options.sustainedWriteMilliseconds,
			)
		}
		await waitForPublicationRefreshIdle()
	} finally {
		unsubscribe()
	}
	const metrics = getPublicationRefreshMetrics()
	return {
		writeCount,
		subscriberCount: options.context.kioskMemberIds.length,
		listenerCount: 4 + options.context.kioskMemberIds.length,
		elapsedMilliseconds: Date.now() - startedAt,
		metrics,
		metricsText: formatPublicationRefreshMetrics(metrics),
	}
}

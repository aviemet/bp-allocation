import { expect } from "chai"
import { Random } from "meteor/random"

import { MemberMethods, PresentationSettingsMethods, ThemeMethods } from "/imports/api/methods"
import { Themes, MemberThemes } from "/imports/api/db"
import { resetDatabase } from "/imports/test-support/resetDatabase"

import {
	baseSettingsForSimulation,
	baseThemeForSimulation,
	buildSyntheticMemberDocuments,
	buildSyntheticMemberThemes,
	buildSyntheticOrgDocuments,
	resolveConcurrentMemberCount,
	resolveConcurrentRoundCount,
	resolveLoadTestScale,
	runMembersPublicationPipelineNaive,
	runMembersPublicationPipelineWithMemberThemeMap,
	runOrganizationsPublicationPipeline,
	runThemePublicationPipeline,
	simulateTriplePublicationRefresh,
} from "/imports/server/test-support/publicationPipelineSimulation"
import { buildMemberThemeLookupMap } from "/imports/server/themeDataLoaders/memberThemeLookup"

describe("Publication pipeline load simulation", function() {

	describe("Synthetic CPU pipeline", function() {

		it("runs theme + organizations + members transforms without throwing", function() {
			const themeId = Random.id()
			const presentationSettingsId = Random.id()
			const scale = resolveLoadTestScale()
			const organizationCount = Math.max(12, Math.min(Math.floor(scale / 4), 80))
			const organizations = buildSyntheticOrgDocuments(themeId, organizationCount)
			const organizationIds = organizations.map(organization => organization._id)
			const memberThemes = buildSyntheticMemberThemes(themeId, scale, organizationIds)
			const members = buildSyntheticMemberDocuments(memberThemes)
			const theme = baseThemeForSimulation(themeId, presentationSettingsId)
			const settings = baseSettingsForSimulation(presentationSettingsId)

			const outcome = simulateTriplePublicationRefresh(theme, settings, memberThemes, organizations, members)

			expect(outcome.themeComputed._id).to.equal(themeId)
			expect(outcome.organizationComputed).to.have.lengthOf(organizationCount)
			expect(outcome.membersNaive).to.have.lengthOf(scale)
		})

		it("member theme lookup via Map matches naive find-per-member results", function() {
			const themeId = Random.id()
			const presentationSettingsId = Random.id()
			const scale = Math.min(resolveLoadTestScale(), 120)
			const organizationCount = 16
			const organizations = buildSyntheticOrgDocuments(themeId, organizationCount)
			const organizationIds = organizations.map(organization => organization._id)
			const memberThemes = buildSyntheticMemberThemes(themeId, scale, organizationIds)
			const members = buildSyntheticMemberDocuments(memberThemes)
			const theme = baseThemeForSimulation(themeId, presentationSettingsId)
			const settings = baseSettingsForSimulation(presentationSettingsId)

			runThemePublicationPipeline(theme, settings, memberThemes, organizations)
			runOrganizationsPublicationPipeline(theme, settings, memberThemes, organizations)

			const naive = runMembersPublicationPipelineNaive(members, memberThemes, themeId)
			const lookup = buildMemberThemeLookupMap(memberThemes, themeId)
			const mapped = runMembersPublicationPipelineWithMemberThemeMap(members, lookup)

			expect(JSON.stringify(mapped)).to.equal(JSON.stringify(naive))
		})

		it("triple-stack publication work completes within a generous time budget", function() {
			this.timeout(120000)
			const themeId = Random.id()
			const presentationSettingsId = Random.id()
			const scale = resolveLoadTestScale()
			const organizationCount = Math.max(12, Math.min(Math.floor(scale / 4), 80))
			const organizations = buildSyntheticOrgDocuments(themeId, organizationCount)
			const organizationIds = organizations.map(organization => organization._id)
			const memberThemes = buildSyntheticMemberThemes(themeId, scale, organizationIds)
			const members = buildSyntheticMemberDocuments(memberThemes)
			const theme = baseThemeForSimulation(themeId, presentationSettingsId)
			const settings = baseSettingsForSimulation(presentationSettingsId)

			const startedAt = Date.now()
			for(let round = 0; round < 3; round++) {
				simulateTriplePublicationRefresh(theme, settings, memberThemes, organizations, members)
			}
			const elapsedMilliseconds = Date.now() - startedAt

			const ceilingMilliseconds = Number.parseInt(process.env.LOAD_TEST_TIME_CEILING_MS ?? "", 10)
			const effectiveCeiling = Number.isFinite(ceilingMilliseconds) && ceilingMilliseconds > 0
				? ceilingMilliseconds
				: 90000

			expect(elapsedMilliseconds).to.be.lessThan(effectiveCeiling)
		})
	})

	describe("Concurrent MemberThemes writes", function() {

		before(async function() {
			await resetDatabase()
		})

		it("handles many concurrent MemberThemes updates", async function() {
			this.timeout(180000)

			const themeTitle = `LoadTestTheme-${Random.id()}`
			const themeIdResult = await ThemeMethods.create.callAsync({
				title: themeTitle,
				leverageTotal: 800000,
			})
			if(!themeIdResult) {
				throw new Error("ThemeMethods.create returned empty")
			}

			const themeDocument = await Themes.findOneAsync({ _id: themeIdResult })
			if(!themeDocument?.presentationSettings) {
				throw new Error("Theme missing presentationSettings")
			}

			await PresentationSettingsMethods.update.callAsync({
				id: themeDocument.presentationSettings,
				data: {
					useKioskFundsVoting: true,
					useKioskChitVoting: true,
				},
			})

			const memberCount = resolveConcurrentMemberCount()
			const memberThemeIds: string[] = []

			for(let index = 0; index < memberCount; index++) {
				const memberThemeId = await MemberMethods.upsert.callAsync({
					firstName: "Concurrent",
					lastName: `Voter${index}`,
					number: 90000 + index,
					theme: themeIdResult,
					amount: 4000,
					phone: "+15550001",
					chits: 10,
				})
				memberThemeIds.push(memberThemeId)
			}

			const rounds = resolveConcurrentRoundCount()
			for(let round = 0; round < rounds; round++) {
				const operations = memberThemeIds.map((memberThemeId, index) =>
					MemberThemes.updateAsync(
						{ _id: memberThemeId },
						{ $set: { chits: (round + index) % 15 } },
					),
				)
				await Promise.all(operations)
			}

			const finalCount = await MemberThemes.find({ theme: themeIdResult }).countAsync()
			expect(finalCount).to.equal(memberCount)
		})
	})
})

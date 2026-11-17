import { expect } from "chai"
import { Random } from "meteor/random"

import { MemberMethods, PresentationSettingsMethods, ThemeMethods } from "/imports/api/methods"
import { Themes, MemberThemes, Members, Organizations, PresentationSettings } from "/imports/api/db"
import { consoleLog } from "/imports/lib/logging"
import { resetDatabase } from "/imports/test-support/resetDatabase"
import { insertTestOrg } from "/imports/test-support"

import {
	baseSettingsForSimulation,
	baseThemeForSimulation,
	buildSyntheticMemberDocuments,
	buildSyntheticMemberThemes,
	buildSyntheticOrgDocuments,
	resolveConcurrentMemberCount,
	resolveConcurrentRoundCount,
	resolveLoadTestPrintMetrics,
	resolveLoadTestScale,
	resolveLoadTestTimeCeilingMs,
	resolveSubscriberCount,
	resolveSustainedWriteMilliseconds,
	runMembersPublicationPipelineNaive,
	runMembersPublicationPipelineWithMemberThemeMap,
	runOrganizationsPublicationPipeline,
	runSubscriptionShapedRefreshStorm,
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

			expect(elapsedMilliseconds).to.be.lessThan(resolveLoadTestTimeCeilingMs())
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

	describe("Subscription-shaped refresh storm", function() {

		before(async function() {
			await resetDatabase()
		})

		it("records cascade metrics under concurrent MemberThemes writes with N listeners", async function() {
			this.timeout(300000)

			const themeIdResult = await ThemeMethods.create.callAsync({
				title: `StormTheme-${Random.id()}`,
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

			const settingsDocument = await PresentationSettings.findOneAsync({
				_id: themeDocument.presentationSettings,
			})
			if(!settingsDocument) {
				throw new Error("PresentationSettings missing after update")
			}

			const organizationCount = 12
			for(let index = 0; index < organizationCount; index++) {
				await insertTestOrg(themeIdResult, {
					title: `Storm Org ${index}`,
					ask: 100000,
				})
			}

			const memberCount = resolveConcurrentMemberCount()
			const memberThemeIds: string[] = []
			for(let index = 0; index < memberCount; index++) {
				const memberThemeId = await MemberMethods.upsert.callAsync({
					firstName: "Storm",
					lastName: `Voter${index}`,
					number: 80000 + index,
					theme: themeIdResult,
					amount: 4000,
					phone: "+15550002",
					chits: 10,
				})
				memberThemeIds.push(memberThemeId)
			}

			const organizations = await Organizations.find({ theme: themeIdResult }).fetchAsync()
			const memberThemeRows = await MemberThemes.find({ theme: themeIdResult }).fetchAsync()
			const memberIds = memberThemeRows
				.map(row => row.member)
				.filter((memberId): memberId is string => typeof memberId === "string")
			const members = await Members.find({ _id: { $in: memberIds } }).fetchAsync()
			const subscriberCount = Math.min(resolveSubscriberCount(), members.length)
			const kioskMemberIds = members.slice(0, subscriberCount).map(member => member._id)

			const outcome = await runSubscriptionShapedRefreshStorm({
				themeId: themeIdResult,
				context: {
					theme: themeDocument,
					settings: settingsDocument,
					organizations,
					members,
					kioskMemberIds,
					initialMemberThemes: memberThemeRows,
				},
				memberThemeIds,
				rounds: resolveConcurrentRoundCount(),
				sustainedWriteMilliseconds: resolveSustainedWriteMilliseconds(),
			})

			if(resolveLoadTestPrintMetrics()) {
				consoleLog.log(
					[
						"[publication refresh storm]",
						`writes=${outcome.writeCount}`,
						`kioskSubscribers=${outcome.subscriberCount}`,
						`listeners=${outcome.listenerCount}`,
						`elapsedMs=${outcome.elapsedMilliseconds}`,
						outcome.metricsText,
					].join("\n"),
				)
			}

			expect(outcome.writeCount).to.be.greaterThan(0)
			expect(outcome.metrics.coordinatorListenerCount).to.equal(0)
			expect(outcome.metrics.byName["coordinator.notify"]).to.exist
			expect(outcome.metrics.byName["coordinator.notify"].startedCount).to.be.greaterThan(0)
			expect(outcome.metrics.byName["coordinator.notify"].maxInFlight).to.equal(1)
			expect(outcome.metrics.byName["themes.refresh"].maxInFlight).to.equal(1)
			expect(outcome.metrics.byName["organizations.refresh"].maxInFlight).to.equal(1)
			expect(outcome.metrics.byName["orgPledgeFunding.refresh"].maxInFlight).to.equal(1)
			expect(outcome.metrics.byName["members.refresh"].maxInFlight).to.equal(1)
			expect(outcome.metrics.byName["member.refresh"]).to.exist
			expect(outcome.metrics.totalListenerInvocations).to.be.greaterThan(0)
			expect(outcome.elapsedMilliseconds).to.be.lessThan(resolveLoadTestTimeCeilingMs(180000))

			const finalCount = await MemberThemes.find({ theme: themeIdResult }).countAsync()
			expect(finalCount).to.equal(memberCount)
		})

		it("only refreshes kiosk member feeds for voters who actually changed", async function() {
			this.timeout(300000)

			const themeIdResult = await ThemeMethods.create.callAsync({
				title: `ScopedStorm-${Random.id()}`,
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

			const settingsDocument = await PresentationSettings.findOneAsync({
				_id: themeDocument.presentationSettings,
			})
			if(!settingsDocument) {
				throw new Error("PresentationSettings missing after update")
			}

			for(let index = 0; index < 8; index++) {
				await insertTestOrg(themeIdResult, {
					title: `Scoped Org ${index}`,
					ask: 100000,
				})
			}

			const memberCount = Math.max(resolveConcurrentMemberCount(), 20)
			const memberThemeIds: string[] = []
			for(let index = 0; index < memberCount; index++) {
				const memberThemeId = await MemberMethods.upsert.callAsync({
					firstName: "Scoped",
					lastName: `Voter${index}`,
					number: 70000 + index,
					theme: themeIdResult,
					amount: 4000,
					phone: "+15550003",
					chits: 10,
				})
				memberThemeIds.push(memberThemeId)
			}

			const organizations = await Organizations.find({ theme: themeIdResult }).fetchAsync()
			const memberThemeRows = await MemberThemes.find({ theme: themeIdResult }).fetchAsync()
			const memberIds = memberThemeRows
				.map(row => row.member)
				.filter((memberId): memberId is string => typeof memberId === "string")
			const members = await Members.find({ _id: { $in: memberIds } }).fetchAsync()
			const subscriberCount = Math.min(resolveSubscriberCount(), members.length)
			const kioskMemberIds = members.slice(0, subscriberCount).map(member => member._id)
			const kioskMemberIdSet = new Set(kioskMemberIds)
			const changedMemberThemeIds = memberThemeRows
				.filter(row => typeof row.member === "string" && kioskMemberIdSet.has(row.member))
				.map(row => row._id)
				.slice(0, 3)

			const outcome = await runSubscriptionShapedRefreshStorm({
				themeId: themeIdResult,
				context: {
					theme: themeDocument,
					settings: settingsDocument,
					organizations,
					members,
					kioskMemberIds,
					initialMemberThemes: memberThemeRows,
				},
				memberThemeIds: changedMemberThemeIds,
				rounds: 4,
			})

			if(resolveLoadTestPrintMetrics()) {
				consoleLog.log(
					[
						"[publication refresh storm scoped]",
						`writes=${outcome.writeCount}`,
						`kioskSubscribers=${outcome.subscriberCount}`,
						`changedVoters=${changedMemberThemeIds.length}`,
						`elapsedMs=${outcome.elapsedMilliseconds}`,
						outcome.metricsText,
					].join("\n"),
				)
			}

			const memberRefresh = outcome.metrics.byName["member.refresh"]
			expect(changedMemberThemeIds.length).to.be.greaterThan(0)
			expect(memberRefresh).to.exist
			expect(memberRefresh.startedCount).to.be.at.most(changedMemberThemeIds.length * 4)
			expect(memberRefresh.startedCount).to.be.lessThan(outcome.subscriberCount)
			expect(outcome.metrics.byName["themes.refresh"].maxInFlight).to.equal(1)
			expect(outcome.metrics.byName["organizations.refresh"].maxInFlight).to.equal(1)
			expect(outcome.metrics.byName["members.refresh"].maxInFlight).to.equal(1)
		})
	})
})

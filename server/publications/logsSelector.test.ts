import { expect } from "chai"
import { Random } from "meteor/random"

import { Logs } from "/imports/api/db"
import { LogCategories } from "/imports/api/db/Logs"
import { buildLogsSelector } from "/imports/server/publications/logsSelector"
import { resetDatabase } from "/imports/test-support/resetDatabase"

describe("buildLogsSelector search", function() {
	beforeEach(async function() {
		await resetDatabase()
	})

	it("matches error.message and meta JSON (e.g. Mongo _id)", async function() {
		const themeId = Random.id()
		const memberId = Random.id()

		await Logs.insertAsync({
			level: "error",
			category: LogCategories.Publication,
			message: "refresh failed",
			themeId,
			action: "members.refresh",
			error: {
				name: "Meteor.Error",
				message: "must call added before changed",
			},
			meta: { memberId },
		})

		await Logs.insertAsync({
			level: "info",
			category: LogCategories.Method,
			message: "unrelated",
			themeId,
		})

		const byErrorText = await Logs.find(
			buildLogsSelector({ themeId, search: "must call added" }),
		).fetchAsync()
		expect(byErrorText).to.have.length(1)
		expect(byErrorText[0]?.message).to.equal("refresh failed")

		const byMetaId = await Logs.find(
			buildLogsSelector({ themeId, search: memberId }),
		).fetchAsync()
		expect(byMetaId).to.have.length(1)
		expect(byMetaId[0]?.meta).to.deep.equal({ memberId })
	})

	it("still matches message and action", async function() {
		const themeId = Random.id()

		await Logs.insertAsync({
			level: "warn",
			category: LogCategories.Sms,
			message: "delivery queued",
			themeId,
			action: "sms.send",
		})

		const byMessage = await Logs.find(
			buildLogsSelector({ themeId, search: "delivery" }),
		).fetchAsync()
		expect(byMessage).to.have.length(1)

		const byAction = await Logs.find(
			buildLogsSelector({ themeId, search: "sms.send" }),
		).fetchAsync()
		expect(byAction).to.have.length(1)
	})

	it("matches log document _id", async function() {
		const themeId = Random.id()
		const logId = await Logs.insertAsync({
			level: "info",
			category: LogCategories.Method,
			message: "ok",
			themeId,
		})

		const found = await Logs.find(
			buildLogsSelector({ themeId, search: logId.slice(0, 10) }),
		).fetchAsync()
		expect(found.some(doc => doc._id === logId)).to.equal(true)
	})
})

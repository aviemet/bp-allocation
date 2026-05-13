import { expect } from "chai"
import { Random } from "meteor/random"

import { LogMethods } from "/imports/api/methods"
import { Logs, type LogData } from "/imports/api/db"
import { LogCategories } from "/imports/api/db/Logs"
import { resetDatabase } from "/imports/test-support/resetDatabase"

const insertTestLog = (themeId: string, overrides: Partial<LogData> = {}) =>
	Logs.insertAsync({
		level: "info",
		category: LogCategories.Method,
		message: "test log",
		themeId,
		...overrides,
	})

describe("Log Methods", function() {
	beforeEach(async function() {
		await resetDatabase()
	})

	describe("purge", function() {
		it("Should remove all logs for the given themeId", async function() {
			const themeId = Random.id()
			await insertTestLog(themeId)
			await insertTestLog(themeId)
			await insertTestLog(themeId)

			const { removed } = await LogMethods.purge.callAsync({ themeId })

			expect(removed).to.equal(3)
			const remaining = await Logs.find({ themeId }).countAsync()
			expect(remaining).to.equal(0)
		})

		it("Should leave logs for other themes alone", async function() {
			const themeIdA = Random.id()
			const themeIdB = Random.id()
			await insertTestLog(themeIdA)
			await insertTestLog(themeIdB)
			await insertTestLog(themeIdB)

			const { removed } = await LogMethods.purge.callAsync({ themeId: themeIdA })

			expect(removed).to.equal(1)
			const themeBCount = await Logs.find({ themeId: themeIdB }).countAsync()
			expect(themeBCount).to.equal(2)
		})

		it("Should return { removed: 0 } when no logs match the themeId", async function() {
			await insertTestLog(Random.id())

			const { removed } = await LogMethods.purge.callAsync({ themeId: Random.id() })

			expect(removed).to.equal(0)
		})

		it("Should throw when the themeId is an empty string", async function() {
			let caught: unknown
			try {
				await LogMethods.purge.callAsync({ themeId: "" })
			} catch (error) {
				caught = error
			}
			expect(caught).to.exist
		})
	})
})

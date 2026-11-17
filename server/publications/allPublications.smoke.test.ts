import { expect } from "chai"

import "/imports/server/publications"
import { MemberMethods } from "/imports/api/methods"
import { Members, MemberThemes } from "/imports/api/db"
import { REGISTERED_PUBLICATION_NAMES } from "/imports/lib/endpoints/appRoutePaths"
import {
	insertTestOrg,
	insertTestTheme,
	resetDatabase,
} from "/imports/test-support"
import {
	getMeteorDdpServer,
	invokePublication,
} from "/imports/test-support/meteorServer"

const hasFetchAsync = (value: unknown): value is { fetchAsync: () => Promise<unknown[]> } => {
	return typeof value === "object"
		&& value !== null
		&& "fetchAsync" in value
		&& typeof value.fetchAsync === "function"
}

describe("all publications smoke", function() {
	let themeId = ""
	let themeSlug = ""
	let memberId = ""

	beforeEach(async function() {
		await resetDatabase()
		const themeBundle = await insertTestTheme()
		themeId = themeBundle.themeId
		themeSlug = themeBundle.theme.slug ?? ""
		await insertTestOrg(themeId)

		const memberThemeId = await MemberMethods.upsert.callAsync({
			firstName: "Smoke",
			lastName: "Tester",
			number: 1,
			theme: themeId,
			amount: 1000,
			chits: 5,
		})
		const memberThemeDoc = await MemberThemes.findOneAsync({ _id: memberThemeId })
		if(!memberThemeDoc?.member) {
			throw new Error("all publications smoke: missing member for fixture")
		}
		memberId = memberThemeDoc.member
		const member = await Members.findOneAsync({ _id: memberId })
		if(!member) {
			throw new Error("all publications smoke: member document missing")
		}
	})

	it("registers every expected publication handler", function() {
		const handlers = getMeteorDdpServer().publish_handlers
		for(const name of REGISTERED_PUBLICATION_NAMES) {
			expect(handlers[name], `missing publication ${name}`).to.be.a("function")
		}
	})

	it("loads every registered publication without error", async function() {
		const cases: Array<{ name: typeof REGISTERED_PUBLICATION_NAMES[number], args: unknown[] }> = [
			{ name: "memberThemes", args: [themeId] },
			{ name: "members", args: [{ themeId, limit: false }] },
			{ name: "member", args: [{ memberId, themeId }] },
			{ name: "themes", args: [] },
			{ name: "themes", args: [themeId] },
			{ name: "theme", args: [themeId] },
			{ name: "themeBySlug", args: [themeSlug] },
			{ name: "organizations", args: [themeId] },
			{ name: "organizations.pledgeFunding", args: [themeId] },
			{ name: "settings", args: [themeId] },
			{ name: "messages", args: [] },
			{ name: "pledgeAnimationQueue", args: [themeId] },
			{ name: "logs.recent", args: [{ themeId }, 50] },
		]

		for(const publicationCase of cases) {
			const { context, result } = await invokePublication(
				publicationCase.name,
				publicationCase.args,
			)

			if(publicationCase.name === "memberThemes") {
				expect(hasFetchAsync(result), `publication ${publicationCase.name} should return a cursor`).to.equal(true)
				if(hasFetchAsync(result)) {
					await result.fetchAsync()
				}
			} else {
				expect(context.wasReady(), `publication ${publicationCase.name} should call ready()`).to.equal(true)
			}

			context.stop()
		}
	})
})

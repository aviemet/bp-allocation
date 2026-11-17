import { expect } from "chai"

import {
	findMemberThemeForMember,
	memberThemeContentSignature,
} from "/imports/server/publications/memberThemeChange"
import { type MemberTheme } from "/imports/types/schema"

describe("memberThemeChange", function() {

	it("treats identical voting fields as the same signature", function() {
		const left: MemberTheme = {
			_id: "a",
			theme: "theme1",
			member: "member1",
			amount: 100,
			chits: 5,
			allocations: [{ organization: "org1", amount: 10, voteSource: "kiosk", createdAt: new Date(0) }],
			chitVotes: [],
		}
		const right: MemberTheme = {
			...left,
			_id: "b",
		}
		expect(memberThemeContentSignature(left)).to.equal(memberThemeContentSignature(right))
	})

	it("changes signature when votes change", function() {
		const before: MemberTheme = {
			_id: "a",
			theme: "theme1",
			member: "member1",
			amount: 100,
			chits: 5,
			allocations: [],
			chitVotes: [],
		}
		const after: MemberTheme = {
			...before,
			chits: 6,
		}
		expect(memberThemeContentSignature(before)).to.not.equal(memberThemeContentSignature(after))
	})

	it("finds the matching member theme row", function() {
		const rows: MemberTheme[] = [
			{ _id: "1", theme: "theme1", member: "other", chits: 1 },
			{ _id: "2", theme: "theme1", member: "target", chits: 2 },
		]
		expect(findMemberThemeForMember(rows, "target", "theme1")?._id).to.equal("2")
		expect(findMemberThemeForMember(rows, "missing", "theme1")).to.equal(undefined)
	})
})

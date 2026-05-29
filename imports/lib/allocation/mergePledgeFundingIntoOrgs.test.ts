import { expect } from "chai"

import { mergePledgeFundingIntoOrgs } from "./mergePledgeFundingIntoOrgs"
import { type OrgDataWithComputed } from "/imports/api/hooks/useOrgs"

const baseOrg = (id: string, need: number): OrgDataWithComputed => ({
	_id: id,
	theme: "theme1",
	title: `Org ${id}`,
	need,
	votedTotal: 0,
	allocatedFunds: 0,
	pledgeTotal: 0,
	save: 0,
	leverageFunds: 0,
	topOff: 0,
	amountFromVotes: 0,
	ask: 1000,
	votes: 0,
})

describe("mergePledgeFundingIntoOrgs", () => {
	it("overlays live need when funding is present", () => {
		const orgs = [baseOrg("a", 500)]
		const merged = mergePledgeFundingIntoOrgs(orgs, { a: 0 })

		expect(merged[0].need).to.equal(0)
		expect(merged[0].title).to.equal("Org a")
	})

	it("keeps static need when funding row is missing", () => {
		const orgs = [baseOrg("a", 500)]
		const merged = mergePledgeFundingIntoOrgs(orgs, {})

		expect(merged[0].need).to.equal(500)
	})
})

import { expect } from "chai"

import { createCoalescedRefresh } from "/imports/server/publications/publicationRefreshCoalesce"

describe("createCoalescedRefresh", function() {

	it("runs work immediately when idle", async function() {
		const coalesced = createCoalescedRefresh()
		let runs = 0

		coalesced.schedule(async () => {
			runs += 1
		})

		await new Promise<void>(resolve => {
			setTimeout(resolve, 20)
		})

		expect(runs).to.equal(1)
		expect(coalesced.isInFlight()).to.equal(false)
		expect(coalesced.isPending()).to.equal(false)
	})

	it("coalesces overlapping schedules into one follow-up run", async function() {
		const coalesced = createCoalescedRefresh()
		const runValues: number[] = []
		let releaseFirst: (() => void) | undefined
		const firstGate = new Promise<void>(resolve => {
			releaseFirst = resolve
		})

		coalesced.schedule(async () => {
			runValues.push(1)
			await firstGate
		})

		await new Promise<void>(resolve => {
			setTimeout(resolve, 5)
		})

		coalesced.schedule(async () => {
			runValues.push(2)
		})
		coalesced.schedule(async () => {
			runValues.push(3)
		})

		expect(coalesced.isInFlight()).to.equal(true)
		expect(coalesced.isPending()).to.equal(true)

		if(releaseFirst) {
			releaseFirst()
		}

		await new Promise<void>(resolve => {
			setTimeout(resolve, 30)
		})

		expect(runValues).to.deep.equal([1, 3])
		expect(coalesced.isInFlight()).to.equal(false)
		expect(coalesced.isPending()).to.equal(false)
	})
})

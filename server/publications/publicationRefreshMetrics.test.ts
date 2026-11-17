import { expect } from "chai"

import {
	formatPublicationRefreshMetrics,
	getPublicationRefreshMetrics,
	recordPublicationChangedEmissions,
	recordPublicationListenerInvocation,
	recordPublicationRefreshTrigger,
	resetPublicationRefreshMetrics,
	summarizeDurations,
	trackPublicationRefresh,
} from "/imports/server/publications/publicationRefreshMetrics"

describe("publicationRefreshMetrics", function() {

	beforeEach(function() {
		resetPublicationRefreshMetrics()
	})

	it("tracks overlapping in-flight refreshes", async function() {
		let releaseFirst: (() => void) | undefined
		let releaseSecond: (() => void) | undefined
		const firstGate = new Promise<void>(resolve => {
			releaseFirst = resolve
		})
		const secondGate = new Promise<void>(resolve => {
			releaseSecond = resolve
		})

		const first = trackPublicationRefresh("themes.refresh", async () => {
			await firstGate
		})
		const second = trackPublicationRefresh("themes.refresh", async () => {
			await secondGate
		})

		await new Promise<void>(resolve => {
			setTimeout(resolve, 10)
		})

		const mid = getPublicationRefreshMetrics()
		expect(mid.byName["themes.refresh"].inFlight).to.equal(2)
		expect(mid.maxInFlightAny).to.equal(2)

		if(releaseFirst) {
			releaseFirst()
		}
		if(releaseSecond) {
			releaseSecond()
		}
		await Promise.all([first, second])

		const done = getPublicationRefreshMetrics()
		expect(done.byName["themes.refresh"].completedCount).to.equal(2)
		expect(done.byName["themes.refresh"].maxInFlight).to.equal(2)
		expect(done.byName["themes.refresh"].inFlight).to.equal(0)
	})

	it("aggregates triggers listeners and changed emissions", function() {
		recordPublicationRefreshTrigger("organizations.refresh")
		recordPublicationRefreshTrigger("organizations.refresh")
		recordPublicationListenerInvocation("coordinator.notify")
		recordPublicationChangedEmissions("organizations.refresh", 12)

		const snapshot = getPublicationRefreshMetrics()
		expect(snapshot.byName["organizations.refresh"].triggerCount).to.equal(2)
		expect(snapshot.byName["organizations.refresh"].changedEmissions).to.equal(12)
		expect(snapshot.totalListenerInvocations).to.equal(1)
		expect(formatPublicationRefreshMetrics(snapshot)).to.include("organizations.refresh")
	})

	it("summarizes duration percentiles", function() {
		expect(summarizeDurations([])).to.deep.equal({ p50: 0, p95: 0, max: 0 })
		expect(summarizeDurations([10, 20, 30, 40, 50])).to.deep.equal({ p50: 30, p95: 50, max: 50 })
	})
})

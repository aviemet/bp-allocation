import { expect } from "chai"
import { Random } from "meteor/random"

import { PledgeAnimationMethods } from "/imports/api/methods"
import { PledgeAnimationQueue } from "/imports/api/db/PledgeAnimationQueue"
import { resetDatabase } from "/imports/test-support/resetDatabase"

describe("PledgeAnimation Methods", function() {
	beforeEach(async function() {
		await resetDatabase()
	})

	describe("enqueuePledgeAnimation", function() {
		it("Should insert an unprocessed queue item with the given metadata", async function() {
			const themeId = Random.id()
			const pledgeId = Random.id()
			const orgId = Random.id()

			const before = new Date()
			await PledgeAnimationMethods.enqueuePledgeAnimation.callAsync({
				themeId,
				pledgeId,
				orgId,
				orgTitle: "Some Org",
			})
			const after = new Date()

			const items = await PledgeAnimationQueue.find({ themeId }).fetchAsync()
			expect(items).to.have.length(1)
			expect(items[0]).to.include({
				themeId,
				pledgeId,
				orgId,
				orgTitle: "Some Org",
				processed: false,
			})
			expect(items[0].timestamp.getTime()).to.be.within(before.getTime(), after.getTime())
		})
	})

	describe("markProcessed", function() {
		it("Should flip processed to true for the given queue item", async function() {
			const queueItemId = await PledgeAnimationQueue.insertAsync({
				themeId: Random.id(),
				pledgeId: Random.id(),
				orgId: Random.id(),
				orgTitle: "Animated Org",
				timestamp: new Date(),
				processed: false,
			})

			await PledgeAnimationMethods.markProcessed.callAsync({ queueItemId })

			const updated = await PledgeAnimationQueue.findOneAsync({ _id: queueItemId })
			expect(updated?.processed).to.equal(true)
		})

		it("Should be a no-op when the queue item does not exist", async function() {
			await PledgeAnimationMethods.markProcessed.callAsync({ queueItemId: Random.id() })
			const count = await PledgeAnimationQueue.find().countAsync()
			expect(count).to.equal(0)
		})
	})
})

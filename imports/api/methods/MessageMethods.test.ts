import { expect } from "chai"
import { Random } from "meteor/random"

import { MessageMethods } from "/imports/api/methods"
import { Messages } from "/imports/api/db"
import { resetDatabase } from "../../test-support/resetDatabase"

describe("Message Methods", function() {
	beforeEach(async function() {
		await resetDatabase()
	})

	describe("Create", function() {
		it("Should insert a new message and return its id", async function() {
			const messageId = await MessageMethods.create.callAsync({
				title: "Welcome",
				type: "text",
				body: "Welcome to the event",
			})

			expect(messageId).to.be.a("string")
			const stored = await Messages.findOneAsync({ _id: messageId })
			expect(stored).to.include({ title: "Welcome", type: "text", body: "Welcome to the event" })
		})

		it("Should reject invalid type values", async function() {
			let caught: unknown
			try {
				await MessageMethods.create.callAsync({
					title: "Invalid",
					type: "carrier-pigeon" as "text" | "email",
				})
			} catch (error) {
				caught = error
			}
			expect(caught).to.exist
		})
	})

	describe("Update", function() {
		it("Should set fields specified in data", async function() {
			const messageId = await MessageMethods.create.callAsync({
				title: "Original",
				type: "email",
				subject: "Hello",
			})

			await MessageMethods.update.callAsync({
				id: messageId,
				data: { title: "Updated", subject: "Hi" },
			})

			const updated = await Messages.findOneAsync({ _id: messageId })
			expect(updated).to.include({ title: "Updated", subject: "Hi", type: "email" })
		})
	})

	describe("Remove", function() {
		it("Should delete the message by id", async function() {
			const messageId = await MessageMethods.create.callAsync({
				title: "Ephemeral",
				type: "text",
			})

			const removed = await MessageMethods.remove.callAsync(messageId)
			expect(removed).to.equal(1)
			expect(await Messages.findOneAsync({ _id: messageId })).to.not.exist
		})

		it("Should return 0 when the message does not exist", async function() {
			const removed = await MessageMethods.remove.callAsync(Random.id())
			expect(removed).to.equal(0)
		})
	})
})

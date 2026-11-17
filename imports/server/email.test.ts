import { type MailDataRequired } from "@sendgrid/mail"
import { expect } from "chai"
import { Meteor } from "meteor/meteor"
import { Random } from "meteor/random"

import {
	emailVotingLinkToMembers,
	getEmailBatchSender,
	resetEmailBatchSender,
	setEmailBatchSender,
	type EmailBatchSender,
	type EmailSendResponse,
} from "./email"
import { Members, MemberThemes, PresentationSettings, Themes, DEFAULT_NUM_TOP_ORGS } from "/imports/api/db"
import { type Message } from "/imports/types/schema"
import { resetDatabase } from "../test-support/resetDatabase"

describe("Email sending", function() {
	let originalSender: EmailBatchSender
	let themeId: string
	let memberId: string
	let message: Message
	let calls: MailDataRequired[]

	before(function() {
		originalSender = getEmailBatchSender()
	})

	after(function() {
		setEmailBatchSender(originalSender)
	})

	beforeEach(async function() {
		await resetDatabase()
		calls = []
		setEmailBatchSender(async messages => {
			calls.push(...messages)
			const response: EmailSendResponse = { statusCode: 202 }
			return [response, {}]
		})

		Meteor.settings.HOST_URL = "https://example.com"

		const presentationSettingsId = await PresentationSettings.insertAsync({})
		themeId = await Themes.insertAsync({
			title: "Test Theme",
			slug: "test-theme",
			presentationSettings: presentationSettingsId,
			messagesStatus: [],
			numTopOrgs: DEFAULT_NUM_TOP_ORGS,
		})

		memberId = await Members.insertAsync({
			firstName: "Ada",
			lastName: "Lovelace",
			number: 1,
			code: "AL1",
			email: "ada@example.com",
		})

		await MemberThemes.insertAsync({
			theme: themeId,
			member: memberId,
			chits: 5,
			amount: 1000,
			chitVotes: [],
			allocations: [],
		})

		message = {
			_id: Random.id(),
			body: "Hello Battery member",
			subject: "Vote now",
			type: "email",
			includeLink: true,
		}
	})

	afterEach(function() {
		resetEmailBatchSender()
	})

	it("sends email messages with voting links", async function() {
		await emailVotingLinkToMembers({ themeId, message, members: [memberId] })

		expect(calls).to.have.lengthOf(1)
		const firstCall = calls[0]
		expect(firstCall.to).to.equal("ada@example.com")
		expect(firstCall.subject).to.equal("Vote now")
		expect(String(firstCall.html)).to.include("https://example.com/v/test-theme/AL1")

		const theme = await Themes.findOneAsync({ _id: themeId })
		const statusEntry = theme?.messagesStatus?.find(entry => entry?.messageId === message._id)
		expect(statusEntry).to.not.be.undefined
		expect(statusEntry?.sent).to.equal(true)
		expect(statusEntry?.sending).to.equal(false)
	})

	it("marks error status when the batch sender rejects", async function() {
		setEmailBatchSender(async () => {
			const failure = new Error("sendgrid failure")
			Reflect.set(failure, "response", { body: { errors: ["boom"] } })
			throw failure
		})

		await emailVotingLinkToMembers({ themeId, message, members: [memberId] })

		const theme = await Themes.findOneAsync({ _id: themeId })
		const statusEntry = theme?.messagesStatus?.find(entry => entry?.messageId === message._id)
		expect(statusEntry).to.not.be.undefined
		expect(statusEntry?.error).to.equal(true)
		expect(statusEntry?.sent).to.equal(false)
	})
})

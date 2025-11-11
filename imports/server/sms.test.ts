import { expect } from "chai"
import { Meteor } from "meteor/meteor"
import { Random } from "meteor/random"

import textVotingLinkToMembers, {
	getSmsClient,
	resetMemberPhoneNumbersQuery,
	setMemberPhoneNumbersQuery,
	setSmsClient,
	type MemberPhoneLookupResult,
	type SmsClient,
	type SmsMessageCreateParams,
	type SmsMessageResponse,
} from "./sms"
import { Members, PresentationSettings, Themes } from "/imports/api/db"
import { type Message } from "/imports/types/schema"
import { resetDatabase } from "../test-support/resetDatabase"

type CreateBehavior = (params: SmsMessageCreateParams) => Promise<SmsMessageResponse>

const buildTestClient = (calls: SmsMessageCreateParams[], behaviors: CreateBehavior[]): SmsClient => {
	return {
		messages: {
			create: (params: SmsMessageCreateParams) => {
				calls.push(params)
				const behavior = behaviors.shift()
				if(behavior) {
					return behavior(params)
				}
				return Promise.resolve({ status: "queued", to: params.to })
			},
		},
	}
}

describe("SMS sending", function() {
	let originalClient: SmsClient
	let themeId: string
	let memberId: string
	let message: Message
	let calls: SmsMessageCreateParams[]
	let behaviors: CreateBehavior[]

	before(function() {
		originalClient = getSmsClient()
	})

	after(function() {
		setSmsClient(originalClient)
	})

	beforeEach(async function() {
		await resetDatabase()
		calls = []
		behaviors = []
		setSmsClient(buildTestClient(calls, behaviors))
		setMemberPhoneNumbersQuery(async (_themeId, memberIds): Promise<MemberPhoneLookupResult[]> => {
			if(memberIds === undefined) {
				return []
			}
			const ids = Array.isArray(memberIds) ? memberIds.filter((value): value is string => typeof value === "string") : []
			const results: MemberPhoneLookupResult[] = []
			for(const id of ids) {
				const record = await Members.findOneAsync({ _id: id })
				if(record && typeof record.phone === "string") {
					results.push({
						_id: id,
						phone: record.phone,
						code: typeof record.code === "string" ? record.code : undefined,
					})
				}
			}
			return results
		})

		Meteor.settings.HOST_URL = "https://example.com"
		Meteor.settings.twilio = {
			accountSid: "sid",
			authToken: "token",
			copilotSid: "copilot",
		}

		const presentationSettingsId = await PresentationSettings.insertAsync({ twilioRateLimit: 1 })
		themeId = await Themes.insertAsync({
			title: "Test Theme",
			slug: "test-theme",
			presentationSettings: presentationSettingsId,
			messagesStatus: [],
		})

		memberId = await Members.insertAsync({
			firstName: "Ada",
			lastName: "Lovelace",
			number: 1,
			code: "AL1",
			phone: "415-555-0101",
		})

		message = {
			_id: Random.id(),
			body: "Hello Battery member",
			type: "text",
			includeLink: true,
		}
	})

	afterEach(function() {
		setSmsClient(originalClient)
		resetMemberPhoneNumbersQuery()
	})

	it("sends SMS messages with voting links", async function() {
		behaviors.push(async params => ({ status: "queued", to: params.to }))

		await textVotingLinkToMembers({ themeId, message, members: [memberId] })

		expect(calls).to.have.lengthOf(1)
		const firstCall = calls[0]
		expect(firstCall.body).to.equal("Hello Battery member\nhttps://example.com/v/test-theme/AL1")
		expect(firstCall.to).to.equal("+14155550101")
		expect(firstCall.messagingServiceSid).to.equal("copilot")

		const theme = await Themes.findOneAsync({ _id: themeId })
		const statusEntry = theme?.messagesStatus?.find(entry => entry?.messageId === message._id)
		expect(statusEntry).to.not.be.undefined
		expect(statusEntry?.sent).to.equal(true)
		expect(statusEntry?.sending).to.equal(false)
	})

	it("retries failed sends and marks completion after success", async function() {
		const failure = new Error("twilio failure")
		behaviors.push(async () => Promise.reject(failure))
		behaviors.push(async params => ({ status: "sent", to: params.to }))

		await textVotingLinkToMembers({ themeId, message, members: [memberId] })

		expect(calls).to.have.lengthOf(2)
		expect(calls[0].to).to.equal("+14155550101")
		expect(calls[1].to).to.equal("+14155550101")

		const theme = await Themes.findOneAsync({ _id: themeId })
		const statusEntry = theme?.messagesStatus?.find(entry => entry?.messageId === message._id)
		expect(statusEntry).to.not.be.undefined
		expect(statusEntry?.sent).to.equal(true)
		expect(statusEntry?.sending).to.equal(false)
	})
})

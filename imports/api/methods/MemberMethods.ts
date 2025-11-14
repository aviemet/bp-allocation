import { isUndefined, isEmpty, find } from "lodash"
import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Meteor } from "meteor/meteor"
import { formatPhoneNumber, sanitizeString } from "/imports/lib/utils"

import { Members, MemberThemes, Organizations } from "/imports/api/db"
import { OrganizationMethods } from "/imports/api/methods"
import { type Member, type MemberTheme } from "/imports/types/schema"

interface MemberInputData extends Partial<Member> {
	amount?: number
	chits?: number
	theme?: string
}

interface MemberUpsertData extends MemberInputData {
	amount: number
	chits: number
	theme: string
}

interface MemberUpdateData extends Pick<Member, "firstName" | "lastName"> {
	fullName?: string
	initials?: string
	number?: number
	phone?: string
	email?: string
}

interface MemberThemeUpdateData extends Partial<Pick<MemberTheme, "amount" | "chits">> {}

export type VotingSource = "kiosk" | "mobile"

interface FundVoteData {
	theme: string
	member: string
	org: string
	amount: number
	voteSource?: VotingSource
}

export interface ChitVoteData {
	theme: string
	member: string
	org: string
	votes: number
	voteSource?: VotingSource
}

interface RemoveMemberFromThemeData {
	memberId: string
	themeId: string
}

interface UpdateMemberData {
	id: string
	data: MemberUpdateData
}

interface UpdateMemberThemeData {
	id: string
	data: MemberThemeUpdateData
}

interface MemberThemeInsertQuery extends Pick<MemberTheme, "member" | "amount" | "chits" | "theme"> {
	phone?: string
	email?: string
}

/**
 * Sanitize the data for an insert or upsert to Members
 * @param {Object} data {firstName, lastName, fullName, initials, number, amount}
 */
const _sanitizeMemberData = function(data: MemberInputData) {
	/**********************
	 * Normalize the data *
	 **********************/
	if(!isUndefined(data.number)) data.number = parseInt(String(data.number))
	if(!isUndefined(data.firstName)) data.firstName = sanitizeString(data.firstName)
	if(!isUndefined(data.lastName)) data.lastName = sanitizeString(data.lastName)
	if(!isUndefined(data.fullName)) data.fullName = sanitizeString(data.fullName)
	if(!isUndefined(data.initials)) data.initials = sanitizeString(data.initials).toUpperCase()
	if(!isEmpty(data.phone)) data.phone = formatPhoneNumber(data.phone!)
	if(!isUndefined(data.email)) data.email = sanitizeString(data.email)

	if(!isUndefined(data.number) && !isUndefined(data.initials)) {
		data.code = sanitizeString(`${data.initials}${data.number}`).toUpperCase()
	}

	return data
}

/**
 * Generate derived fields from given data
 * @param {object} data {firstName, lastName, fullName, initials, number, amount}
 */
const _buildMissingData = function(data: MemberInputData) {
	let { firstName, lastName, fullName, number, initials, phone, email, code } = _sanitizeMemberData(data)
	// Build first/last from fullName if not present
	if(isUndefined(firstName) && isUndefined(lastName) && !isUndefined(fullName)) {
		const nameArr = fullName.split(" ")
		if(nameArr.length >= 2) {
			firstName = nameArr[0]
			lastName = nameArr[nameArr.length - 1]
		}
	}

	// Build fullName from first/last if not present
	if(isUndefined(fullName) && !isUndefined(firstName) && !isUndefined(lastName)) {
		fullName = firstName + " " + lastName
	}

	// Build initials from first/last if not present
	if(isEmpty(initials) && !isUndefined(firstName) && !isUndefined(lastName)) {
		initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
	}

	// Build code from initials and number
	if(!isUndefined(initials) && !isUndefined(number)) {
		code = `${initials}${String(number)}`
	}
	return { firstName, lastName, fullName, number, initials: initials ? initials.toUpperCase() : initials, phone, email, code }
}

/**
 * Upserts a member
 * @param  {Object} data {firstName, lastName, fullName, initials, number, amount}
 */
const _memberInsert = async function(data: MemberInputData): Promise<string> {
	const { firstName, lastName, fullName, number, initials, code, phone, email } = _buildMissingData(data)

	/*****************
	 * Build a Query *
	 *****************/

	// Search by either of first/last or full name
	const memberQuery: { $or: Array<Record<string, unknown>> } = { "$or": [] }
	if(!isUndefined(firstName) && !isUndefined(lastName)) {
		memberQuery.$or.push({ firstName, lastName, number })
	}
	if(!isUndefined(fullName)) {
		memberQuery.$or.push({ fullName, number })
	}

	// Check if the member already exists
	const member = await Members.findOneAsync(memberQuery)

	if(!member) {
		if(!firstName || !lastName || number === undefined) {
			throw new Error("firstName, lastName, and number are required to create a member")
		}
		const newMember = { firstName, lastName, fullName, number, initials, code, phone, email }
		try {
			return await Members.insertAsync(newMember)
		} catch (e) {
			console.error({ newMember, e })
			throw e
		}
	} else {
		const updateData: Record<string, unknown> = {
			initials,
			code,
		}

		if(phone) updateData.phone = phone
		if(email) updateData.email = email

		if(member.initials !== initials || member.phone !== phone || member.email !== email) {
			await Members.updateAsync({ _id: member._id }, { $set: updateData })
		}
		return member._id
	}
}

/**
 * Upserts a memberTheme assocication
 * @param  {Object} query
 */
const _memberThemeInsert = async function(query: MemberThemeInsertQuery): Promise<string> {
	// Check if this member is already associated with this theme
	const memberTheme = await MemberThemes.findOneAsync({ member: query.member, theme: query.theme })

	// New member/theme association
	if(!memberTheme) {
		try {
			return await MemberThemes.insertAsync(query)
		} catch (e) {
			console.error(e)
			throw e
		}
	// Existing member/theme association
	} else {
		try {
			await MemberThemes.updateAsync({ _id: memberTheme._id }, { $set: { amount: query.amount } })
			return memberTheme._id
		} catch (e) {
			console.error(e)
			throw e
		}
	}
}

/******************************************
 * BEGIN PUBLIC MEMBER METHODS DEFINITION *
 ******************************************/

const MemberMethods = {
	/*********************
	 * Create new Member *
	 *********************/
	upsert: new ValidatedMethod({
		name: "members.upsert",

		validate: null,

		async run(data: MemberUpsertData) {
			const { amount, chits, theme, phone, email } = data
			try {
				// Create/edit member
				const member = await _memberInsert(data)
				const memberThemeQuery = { member, amount, chits, theme, phone, email }

				// Create/edit theme association
				return await _memberThemeInsert(memberThemeQuery)
			} catch (memberError) {
				console.error({ memberError })
				throw memberError
			}
		},
	}),

	/********************************
	 * Remove one Member from Theme *
	 ********************************/
	removeMemberFromTheme: new ValidatedMethod({
		name: "members.removeMemberFromTheme",

		validate: null,

		async run({ memberId, themeId }: RemoveMemberFromThemeData) {
			const orgs = await Organizations.find({ theme: themeId }).fetchAsync()

			for(const org of orgs) {
				if(org.pledges) {
					for(const pledge of org.pledges) {
						if(pledge.member === memberId) {
							await OrganizationMethods.removePledge.callAsync({ orgId: org._id, pledgeId: pledge._id })
						}
					}
				}
			}

			return await MemberThemes.removeAsync({ member: memberId, theme: themeId })
		},
	}),

	// TODO: Convert this to a batch remove members method
	/*********************************
	 * Remove All Members From Theme *
	 *********************************/
	removeAllMembers: new ValidatedMethod({
		name: "members.removeAllMembers",

		validate: null,

		async run(themeId: string) {
			const memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()
			const ids: string[] = []
			const members: string[] = []
			memberThemes.forEach(memberTheme => {
				ids.push(memberTheme._id)
				members.push((memberTheme as any).member)
			})

			// Batch delete the MemberThemes first
			try {
				await MemberThemes.removeAsync({ _id: { $in: ids } })
			} catch (e) {
				console.error(e)
			}

			// Then delete all matched pledges from every member
			const orgs = await Organizations.find({ theme: themeId }).fetchAsync()
			for(const org of orgs) {
				if(org.pledges) {
					for(const pledge of org.pledges) {
						if(pledge.member && members.some(member => pledge.member === member)) {
							try {
								await OrganizationMethods.removePledge.callAsync({ orgId: org._id, pledgeId: pledge._id })
							} catch (e) {
								console.error(e)
							}
						}
					}
				}
			}

		},
	}),

	/*****************
	 * Update Member *
	 *****************/
	update: new ValidatedMethod({
		name: "members.update",

		validate: null,

		async run({ id, data }: UpdateMemberData) {
			data.fullName = `${data.firstName} ${data.lastName}`
			const sanitizedData = _sanitizeMemberData(data)
			return await Members.updateAsync({ _id: id }, { $set: sanitizedData as Record<string, unknown> })
		},
	}),

	/**********************
	 * Update MemberTheme *
	 **********************/
	updateTheme: new ValidatedMethod({
		name: "members.updateTheme",

		validate: null,

		async run({ id, data }: UpdateMemberThemeData) {
			return await MemberThemes.updateAsync({ _id: id }, { $set: data })
		},
	}),

	/***************************************************
	 * Record funds allocation vote for member for org *
	 ***************************************************/
	fundVote: new ValidatedMethod({
		name: "members.fundVote",

		validate: null,

		async run({ theme, member, org, amount, voteSource }: FundVoteData) {
			if(!Meteor.isServer) return

			// Check for existing allocation for this org from this member
			const memberTheme = await MemberThemes.findOneAsync({ theme, member })
			if(!memberTheme) return

			const allocation = find(memberTheme.allocations, ["organization", org])

			// Update amount
			if(!allocation) {
				await MemberThemes.updateAsync({ theme: theme, member: member }, {
					$push: {
						allocations: {
							organization: org,
							amount,
							voteSource,
						},
					},
				})
			// Or insert allocation vote
			} else {
				await MemberThemes.updateAsync({
					theme: theme, member: member, allocations: {
						$elemMatch: {
							organization: org,
						},
					},
				}, {
					$set: {
						"allocations.$.amount": amount,
						"allocations.$.voteSource": voteSource,
					},
				})
			}
		},
	}),

	/***************************************************
	 * Record chit votes for member for org *
	 ***************************************************/
	chitVote: new ValidatedMethod({
		name: "members.chitVote",

		validate: null,

		async run({ theme, member, org, votes, voteSource }: ChitVoteData) {
			if(!Meteor.isServer) return

			// Check for existing allocation for this org from this member
			const memberTheme = await MemberThemes.findOneAsync({ theme, member })
			if(!memberTheme) return

			const chitVote = find(memberTheme.chitVotes, ["organization", org])

			// Update votes
			if(!chitVote) {
				await MemberThemes.updateAsync({ theme: theme, member: member }, {
					$push: {
						chitVotes: {
							organization: org,
							votes,
							voteSource,
						},
					},
				})
				// Or insert chitVote vote
			} else {
				await MemberThemes.updateAsync({
					theme: theme, member: member, chitVotes: {
						$elemMatch: {
							organization: org,
						},
					},
				}, {
					$set: {
						"chitVotes.$.votes": votes,
						"chitVotes.$.voteSource": voteSource,
					},
				})
			}

		},
	}),

	/************************************
	 * Reset chit votes for member to 0 *
	 ************************************/
	resetChitVotes: new ValidatedMethod({
		name: "member.resetChitVotes",

		validate: null,

		async run(id: string) {
			return await MemberThemes.updateAsync({ _id: id }, { $set: { chitVotes: [] } })
		},
	}),

	/***********************************
	* Reset funds votes for member to 0 *
	***********************************/
	resetFundsVotes: new ValidatedMethod({
		name: "member.resetFundsVotes",

		validate: null,

		async run(id: string) {
			return await MemberThemes.updateAsync({ _id: id }, { $set: { allocations: [] } })
		},
	}),

	/*****************
	 * Delete Member *
	 *****************/
	remove: new ValidatedMethod({
		name: "members.remove",

		validate: null,

		async run(id: string) {
			const member = await Members.findOneAsync(id)
			if(!member) {
				throw new Meteor.Error("MemberMethods.remove", "Member to be removed was not found")
			}

			// Delete associated MemberThemes
			try {
				await MemberThemes.removeAsync({ member: member._id })
			} catch (err) {
				console.error(err)
			}

			// Remove member
			try {
				return await Members.removeAsync(id)
			} catch (err) {
				console.error(err)
				throw err
			}

		},
	}),

}

export default MemberMethods

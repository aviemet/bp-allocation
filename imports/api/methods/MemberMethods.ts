import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import _ from 'lodash'
import { formatPhoneNumber, sanitizeString } from '/imports/lib/utils'

import { Members, MemberThemes, Organizations } from '/imports/api/db'
import { OrganizationMethods } from '/imports/api/methods'

type MemberData = {
	firstName: string
	lastName: string
	fullName: string
	initials: string
	number: number
	amount: number
	phone?: string
	email?: string
	code?: string
}

/**
 * Sanitize the data for an insert or upsert to Members
 * @param {Object} data {firstName, lastName, fullName, initials, number, amount}
 */
const _sanitizeMemberData = function(data: MemberData) {
	/**********************
	 * Normalize the data *
	 **********************/
	if(!_.isUndefined(data.number)) data.number = Math.floor(data.number)
	if(!_.isUndefined(data.firstName)) data.firstName = sanitizeString(data.firstName)
	if(!_.isUndefined(data.lastName)) data.lastName = sanitizeString(data.lastName)
	if(!_.isUndefined(data.fullName)) data.fullName = sanitizeString(data.fullName)
	if(!_.isUndefined(data.initials)) data.initials = sanitizeString(data.initials)
	if(!_.isEmpty(data.phone)) data.phone = formatPhoneNumber(data.phone!)
	if(!_.isUndefined(data.email)) data.email = sanitizeString(data.email)

	return data
}

/**
 * Generate derived fields from given data
 * @param {object} data {firstName, lastName, fullName, initials, number, amount}
 */
const _buildMissingData = function(data: MemberData) {
	let { firstName, lastName, fullName, number, initials, phone, email, code } = _sanitizeMemberData(data)
	// Build first/last from fullName if not present
	if(_.isUndefined(firstName) && _.isUndefined(lastName) && !_.isUndefined(fullName)) {
		const nameArr = fullName.split(' ')
		if(nameArr.length >= 2) {
			firstName = nameArr[0]
			lastName = nameArr[nameArr.length - 1]
		}
	}

	// Build fullName from first/last if not present
	if(_.isUndefined(fullName) && !_.isUndefined(firstName) && !_.isUndefined(lastName)) {
		fullName = firstName + ' ' + lastName
	}

	// Build initials from first/last if not present
	if(_.isEmpty(initials) && !_.isUndefined(firstName) && !_.isUndefined(lastName)) {
		initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
	}

	// Build code from initials and number
	if(!_.isUndefined(initials) && !_.isUndefined(number)) {
		code = `${initials}${String(number)}`
	}
	return { firstName, lastName, fullName, number, initials, phone, email, code }
}

/**
 * Upserts a member
 * @param  {Object} data {firstName, lastName, fullName, initials, number, amount}
 */
const _memberInsert = function(data: MemberData) {
	const { firstName, lastName, fullName, number, initials, code, phone, email } = _buildMissingData(data)

	/*****************
	 * Build a Query *
	 *****************/

	let queryArgs: Partial<{
		firstName: string
		lastName: string
		number: number
	}  | {
		fullName: string
		number: number
	}> = {}

	// Search by either of first/last or full name
	if(!_.isUndefined(firstName) && !_.isUndefined(lastName)) {
		queryArgs = { firstName, lastName, number }
		// memberQuery.$or.push({ firstName, lastName, number })
	}
	if(!_.isUndefined(fullName)) {
		queryArgs = { fullName, number }
		// memberQuery.$or.push({ fullName, number })
	}

	// Check if the member already exists
	let member = Members.find({ '$or': [queryArgs] }).fetch()[0]
	return new Promise((resolve, reject) => {
		if(!member) {
			const newMember = { firstName, lastName, fullName, number, initials, code, phone, email }
			try {
				Members.insert(newMember, (err: Error, result: string) => {
					if(err){
						console.error({ newMember })
						reject(err)
					} else {
						resolve(result)
					}
				})
			} catch(e) {
				console.error(e)
			}
		} else {
			const updateData: Partial<Schema.Member> = {
				initials,
				code,
			}

			if(phone) updateData.phone = phone
			if(email) updateData.email = email

			if(member.initials !== initials || member.phone !== phone || member.email !== email) {
				Members.update({ _id: member._id }, { $set: updateData })
			}
			resolve(member._id)
		}
	})
}

/**
 * Upserts a memberTheme assocication
 * @param  {Object} query
 */
const _memberThemeInsert = function(query: Partial<Schema.MemberTheme>) {
	// Check if this member is already associated with this theme
	let memberTheme = MemberThemes.findOne({ member: query.member, theme: query.theme })

	return new Promise((resolve, reject) => {
		// New member/theme association
		if(!memberTheme) {
			try {
				MemberThemes.insert(query, (err: Error, result: string) => {
					if(err) {
						reject(err)
					} else {
						resolve(result)
					}
				})
			} catch(e) {
				console.error(e)
			}
		// Existing member/theme association
		} else {
			try {
				MemberThemes.update(
					{ _id: memberTheme._id },
					{ $set: {
						amount: query.amount,
					} },
					(err: Error, result: number) => {
						if(err) {
							reject(err)
						} else {
							resolve(memberTheme?._id)
						}
					})
			} catch(e) {
				console.error(e)
			}
		}
	})
}

/******************************************
 * BEGIN PUBLIC MEMBER METHODS DEFINITION *
 ******************************************/

const MemberMethods = {
	/*********************
	 * Create new Member *
	 *********************/
	upsert: new ValidatedMethod({
		name: 'members.upsert',

		validate: null,

		run(data) {
			const { amount, chits, theme, phone, email } = data
			// Create/edit member
			return _memberInsert(data).then(member => {
				const memberThemeQuery = { member, amount, chits, theme, phone, email }

				// Create/edit theme association
				return _memberThemeInsert(memberThemeQuery)

			}, memberError => {
				console.error({ memberError })
			})
		},
	}),

	/********************************
	 * Remove one Member from Theme *
	 ********************************/
	removeMemberFromTheme: new ValidatedMethod({
		name: 'members.removeMemberFromTheme',

		validate: null,

		run({ memberId, themeId }) {
			const orgs = Organizations.find({ theme: themeId }).fetch()

			orgs.forEach(org => {
				org.pledges.forEach(pledge => {
					if(pledge.member === memberId) {
						OrganizationMethods.removePledge.call({ orgId: org._id, pledgeId: pledge._id })
					}
				})
			})

			return MemberThemes.remove({ member: memberId, theme: themeId })
		},
	}),

	// TODO: Convert this to a batch remove members method
	/*********************************
	 * Remove All Members From Theme *
	 *********************************/
	removeAllMembers: new ValidatedMethod({
		name: 'members.removeAllMembers',

		validate: null,

		run(themeId: string) {
			const memberThemes: Schema.MemberTheme[] = MemberThemes.find({ theme: themeId }, { _id: true, member: true }).fetch()
			const ids: string[] = []
			const members: string[] = []

			memberThemes.forEach(memberTheme => {
				ids.push(memberTheme._id)
				// TODO: This was there before, did it ever work?
				// members.push(memberThemes.members)
				members.push(memberTheme.member)
			})

			// Batch delete the MemberThemes first
			try {
				MemberThemes.remove({ _id: { $in: ids } })
			} catch(e) {
				console.error(e)
			}

			// Then delete all matched pledges from every member
			const orgs = Organizations.find({ theme: themeId }).fetch()
			orgs.forEach(org => {
				if(org.pledges) {
					org.pledges.forEach(pledge => {
						if(pledge.member && members.some(member => pledge.member === member)) {
							try {
								OrganizationMethods.removePledge({ orgId: org._id, pledgeId: pledge._id })
							} catch(e) {
								console.error(e)
							}
						}
					})
				}
			})

		},
	}),

	/*****************
	 * Update Member *
	 *****************/
	update: new ValidatedMethod({
		name: 'members.update',

		validate: null,

		run({ id, data }: { id: string, data: MemberData }) {
			data.fullName = `${data.firstName} ${data.lastName}`
			return Members.update({ _id: id }, { $set: _sanitizeMemberData(data) })
		},
	}),

	/**********************
	 * Update MemberTheme *
	 **********************/
	updateTheme: new ValidatedMethod({
		name: 'members.updateTheme',

		validate: null,

		run({ id, data }: { id: string, data: MemberData }) {
			return MemberThemes.update({ _id: id }, { $set: data })
		},
	}),

	/***************************************************
	 * Record funds allocation vote for member for org *
	 ***************************************************/
	fundVote: new ValidatedMethod({
		name: 'members.fundVote',

		validate: null,

		run({ theme, member, org, amount, voteSource }) {
			if(!Meteor.isServer) return

			// Check for existing allocation for this org from this member
			let memberTheme = MemberThemes.findOne({ theme, member })

			let allocation = _.find(memberTheme.allocations, ['organization', org])

			// Update amount
			if(!allocation) {
				MemberThemes.update({ theme: theme, member: member }, {
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
				MemberThemes.update({
					theme: theme, member: member, allocations: {
						$elemMatch: {
							organization: org,
						},
					},
				}, {
					$set: {
						'allocations.$.amount': amount,
						'allocations.$.voteSource': voteSource,
					},
				})
			}
		},
	}),

	/***************************************************
	 * Record chit votes for member for org *
	 ***************************************************/
	chitVote: new ValidatedMethod({
		name: 'members.chitVote',

		validate: null,

		run({ theme, member, org, votes, voteSource }) {
			if(Meteor.isServer) {
				// Check for existing allocation for this org from this member
				let memberTheme = MemberThemes.findOne({ theme, member })

				let chitVote = _.find(memberTheme.chitVotes, ['organization', org])

				// Update votes
				if(!chitVote) {
					MemberThemes.update({ theme: theme, member: member }, {
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
					MemberThemes.update({
						theme: theme, member: member, chitVotes: {
							$elemMatch: {
								organization: org,
							},
						},
					}, {
						$set: {
							'chitVotes.$.votes': votes,
							'chitVotes.$.voteSource': voteSource,
						},
					})
				}
			}
		},
	}),

	/************************************
	 * Reset chit votes for member to 0 *
	 ************************************/
	resetChitVotes: new ValidatedMethod({
		name: 'member.resetChitVotes',

		validate: null,

		run(id: string) {
			MemberThemes.update({ _id: id }, { $set: { chitVotes: [] } })
		},
	}),

	/***********************************
	* Reset funds votes for member to 0 *
	***********************************/
	resetFundsVotes: new ValidatedMethod({
		name: 'member.resetFundsVotes',

		validate: null,

		run(id: string) {
			MemberThemes.update({ _id: id }, { $set: { allocations: [] } })
		},
	}),

	/*****************
	 * Delete Member *
	 *****************/
	remove: new ValidatedMethod({
		name: 'members.remove',

		validate: null,

		run(id: string) {
			let member = Members.findOne(id)
			if(!member){
				throw new Meteor.Error('MemberMethods.remove', 'Member to be removed was not found')
			}

			// Delete associated MemberThemes
			MemberThemes.remove({ member: member._id }, (err: Error) => {
				if(err) console.error(err)
			})

			// Remove member
			return Members.remove(id, (err: Error) => {
				if(err) console.error(err)
			})

		},
	}),

}

export default MemberMethods

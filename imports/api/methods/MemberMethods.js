import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { isUndefined, isEmpty } from 'lodash'
import { formatPhoneNumber, sanitizeString } from '/imports/lib/utils'

import { Members, MemberThemes, Organizations } from '/imports/api/db'
import { OrganizationMethods } from '/imports/api/methods'

/**
 * Sanitize the data for an insert or upsert to Members
 * @param {Object} data {firstName, lastName, fullName, initials, number, amount}
 */
const _sanitizeMemberData = function(data) {
	/**********************
	 * Normalize the data *
	 **********************/
	if(!isUndefined(data.number)) data.number = parseInt(data.number)
	if(!isUndefined(data.firstName)) data.firstName = sanitizeString(data.firstName)
	if(!isUndefined(data.lastName)) data.lastName = sanitizeString(data.lastName)
	if(!isUndefined(data.fullName)) data.fullName = sanitizeString(data.fullName)
	if(!isUndefined(data.initials)) data.initials = sanitizeString(data.initials)
	if(!isEmpty(data.phone)) data.phone = formatPhoneNumber(data.phone)
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
const _buildMissingData = function(data) {
	let { firstName, lastName, fullName, number, initials, phone, email, code } = _sanitizeMemberData(data)
	// Build first/last from fullName if not present
	if(isUndefined(firstName) && isUndefined(lastName) && !isUndefined(fullName)) {
		const nameArr = fullName.split(' ')
		if(nameArr.length >= 2) {
			firstName = nameArr[0]
			lastName = nameArr[nameArr.length - 1]
		}
	}

	// Build fullName from first/last if not present
	if(isUndefined(fullName) && !isUndefined(firstName) && !isUndefined(lastName)) {
		fullName = firstName + ' ' + lastName
	}

	// Build initials from first/last if not present
	if(isEmpty(initials) && !isUndefined(firstName) && !isUndefined(lastName)) {
		initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
	}

	// Build code from initials and number
	if(!isUndefined(initials) && !isUndefined(number)) {
		code = `${initials}${String(number)}`
	}
	return { firstName, lastName, fullName, number, initials, phone, email, code }
}

/**
 * Upserts a member
 * @param  {Object} data {firstName, lastName, fullName, initials, number, amount}
 */
const _memberInsert = function(data) {
	const { firstName, lastName, fullName, number, initials, code, phone, email } = _buildMissingData(data)

	/*****************
	 * Build a Query *
	 *****************/

	// Search by either of first/last or full name
	const memberQuery = { '$or': [] }
	if(!isUndefined(firstName) && !isUndefined(lastName)) {
		memberQuery.$or.push({ firstName, lastName, number })
	}
	if(!isUndefined(fullName)) {
		memberQuery.$or.push({ fullName, number })
	}

	// Check if the member already exists
	let member = Members.find(memberQuery).fetch()[0]
	return new Promise((resolve, reject) => {
		if(!member) {
			const newMember = { firstName, lastName, fullName, number, initials, code, phone, email }
			try{
				Members.insert(newMember, (err, result) => {
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
			const updateData = {
				initials,
				code
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
const _memberThemeInsert = function(query) {
	// Check if this member is already associated with this theme
	let memberTheme = MemberThemes.findOne({ member: query.member, theme: query.theme })

	return new Promise((resolve, reject) => {
		// New member/theme association
		if(!memberTheme) {
			try {
				MemberThemes.insert(query, (err, result) => {
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
				MemberThemes.update({ _id: memberTheme._id }, { $set: { amount: query.amount } }, (err, result) => {
					if(err) {
						reject(err)
					} else {
						resolve(memberTheme._id)
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
		}
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
		}
	}),

	// TODO: Convert this to a batch remove members method
	/*********************************
	 * Remove All Members From Theme *
	 *********************************/
	removeAllMembers: new ValidatedMethod({
		name: 'members.removeAllMembers',

		validate: null,

		run(themeId) {
			const memberThemes = MemberThemes.find({ theme: themeId }, { _id: true, member: true }).fetch()
			const ids = []
			const members = []
			memberThemes.forEach(memberTheme => {
				ids.push(memberTheme._id)
				members.push(memberThemes.members)
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

		}
	}),

	/*****************
	 * Update Member *
	 *****************/
	update: new ValidatedMethod({
		name: 'members.update',

		validate: null,

		run({ id, data }) {
			data.fullName = `${data.firstName} ${data.lastName}`
			return Members.update({ _id: id }, { $set: _sanitizeMemberData(data) })
		}
	}),

	/**********************
	 * Update MemberTheme *
	 **********************/
	updateTheme: new ValidatedMethod({
		name: 'members.updateTheme',

		validate: null,

		run({ id, data }) {
			return MemberThemes.update({ _id: id }, { $set: data })
		}
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

			let allocation = find(memberTheme.allocations, ['organization', org])

			// Update amount
			if(!allocation) {
				MemberThemes.update({ theme: theme, member: member }, {
					$push: {
						allocations: {
							organization: org,
							amount,
							voteSource
						}
					}
				})
			// Or insert allocation vote
			} else {
				MemberThemes.update({
					theme: theme, member: member, allocations: {
						$elemMatch: {
							organization: org
						}
					}
				}, {
					$set: {
						'allocations.$.amount': amount,
						'allocations.$.voteSource': voteSource
					}
				})
			}
		}
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

				let chitVote = find(memberTheme.chitVotes, ['organization', org])

				// Update votes
				if(!chitVote) {
					MemberThemes.update({ theme: theme, member: member }, {
						$push: {
							chitVotes: {
								organization: org,
								votes,
								voteSource
							}
						}
					})
				// Or insert chitVote vote
				} else {
					MemberThemes.update({
						theme: theme, member: member, chitVotes: {
							$elemMatch: {
								organization: org
							}
						}
					}, {
						$set: {
							'chitVotes.$.votes': votes,
							'chitVotes.$.voteSource': voteSource
						}
					})
				}
			}
		}
	}),

	/************************************
	 * Reset chit votes for member to 0 *
	 ************************************/
	resetChitVotes: new ValidatedMethod({
		name: 'member.resetChitVotes',

		validate: null,

		run(id) {
			MemberThemes.update({ _id: id }, { $set: { chitVotes: [] } })
		}
	}),

	/***********************************
	* Reset funds votes for member to 0 *
	***********************************/
	resetFundsVotes: new ValidatedMethod({
		name: 'member.resetFundsVotes',

		validate: null,

		run(id) {
			MemberThemes.update({ _id: id }, { $set: { allocations: [] } })
		}
	}),

	/*****************
	 * Delete Member *
	 *****************/
	remove: new ValidatedMethod({
		name: 'members.remove',

		validate: null,

		run(id) {
			let member = Members.findOne(id)
			if(!member){
				throw new Meteor.Error('MemberMethods.remove', 'Member to be removed was not found')
			}

			// Delete associated MemberThemes
			MemberThemes.remove({ member: member._id }, err => {
				if(err) console.error(err)
			})

			// Remove member
			return Members.remove(id, err => {
				if(err) console.error(err)
			})

		}
	}),

}

export default MemberMethods

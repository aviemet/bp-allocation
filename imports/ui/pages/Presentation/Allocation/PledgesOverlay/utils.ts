import { type PledgeWithOrg } from "/imports/api/stores/OrgsCollection"

export const convertPledgeToPlainObject = (pledge: PledgeWithOrg): PledgeWithOrg => ({
	_id: pledge._id,
	amount: pledge.amount,
	member: pledge.member,
	anonymous: pledge.anonymous,
	createdAt: pledge.createdAt,
	notes: pledge.notes,
	org: {
		_id: pledge.org._id,
		title: pledge.org.title,
	},
})


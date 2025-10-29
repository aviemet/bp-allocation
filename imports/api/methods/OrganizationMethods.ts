import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Meteor } from "meteor/meteor"

import { roundFloat } from "/imports/lib/utils"

import { Themes, Organizations, type OrgData } from "/imports/api/db"
import ImageMethods from "./ImageMethods"
import { type Organization, type MatchPledge } from "/imports/types/schema"

interface OrganizationCreateData extends Omit<OrgData, "_id" | "createdAt"> {
	theme: string
}

interface OrganizationUpdateData {
	id: string
	data: Partial<Organization>
}

interface PledgeData {
	id: string
	amount: number
	member: string
	anonymous?: boolean
}

interface RemovePledgeData {
	orgId: string
	pledgeId: string
}

interface RemovePledgeByIdData {
	themeId: string
	pledgeIds: string | string[]
}

interface TopOffData {
	id: string
	negate?: boolean
}

interface ResetData {
	id: string
}

const OrganizationMethods = {
	/**
	 * Create new Organization
	 */
	create: new ValidatedMethod({
		name: "organizations.create",

		validate: null,

		run(data: OrganizationCreateData) {
			let result: { error?: unknown, response?: string } = {}
			Organizations.insert(data, (error: unknown, response: string) => {
				if(error) {
					console.error(error)
				} else {
					Themes.update({ _id: data.theme }, {
						$push: { organizations: response },
					})
				}
				result = { error, response }
			})
			return result
		},
	}),

	/**
	 * Update Organization
	 */
	update: new ValidatedMethod({
		name: "organizations.update",

		validate: null,

		run({ id, data }: OrganizationUpdateData) {
			console.log({ id, data })
			return Organizations.update({ _id: id }, { $set: data })
		},
	}),

	/**
	 * Delete Organization
	 */
	remove: new ValidatedMethod({
		name: "organizations.remove",

		validate: null,

		run(id: string) {
			let org = Organizations.findOne(id)
			if(org) {
				// First delete any associated images
				if(org.image) {
					ImageMethods.remove.call(org.image)
				}

				// Remove organization
				Organizations.remove(id, (err: unknown) => {
					if(err) console.error(err)

					Themes.update({ _id: org.theme }, { $pull: { organizations: id } })
				})
				return 1
			} else {
				throw new Meteor.Error("OrganizationMethods.remove", "Organization to be removed was not found")
			}
		},
	}),

	/**
	 * Batch Delete Organizations
	 */
	removeMany: new ValidatedMethod({
		name: "organizations.removeMany",

		validate: null,

		run(ids: string[]) {
			// Get list of associated images to remove
			var images = Organizations.find({ _id: { $in: ids }, image: { $exists: true } }, { fields: { _id: 0, image: 1 } }).map((org) => {
				return org.image
			})

			// Remove the images
			ImageMethods.removeMany.call(images)

			// Remove organization
			Organizations.remove({ _id: { $in: ids } })
		},
	}),


	/**
	 * Add a matched pledge
	 */
	pledge: new ValidatedMethod({
		name: "organizations.pledge",

		validate: null,

		run({ id, amount, member, anonymous }: PledgeData) {
			amount = roundFloat(String(amount))

			const saveData: MatchPledge = { _id: "", amount, member, anonymous }

			return Organizations.update({ _id: id }, {
				$push: {
					pledges: saveData,
				},
			})
		},
	}),

	/**
	 * Remove a matched pledge
	 */
	removePledge: new ValidatedMethod({
		name: "organizations.removePledge",

		validate: null,

		run({ orgId, pledgeId }: RemovePledgeData) {
			return Organizations.update(
				{ _id: orgId },
				{
					$pull: {
						pledges: { _id: pledgeId },
					},
				}
			)
		},
	}),

	/**
	 * Remove a matched pledge without the orgId
	 */
	removePledgeById: new ValidatedMethod({
		name: "organizations.removePledgeById",

		validate: null,

		run({ themeId, pledgeIds }: RemovePledgeByIdData) {
			if(!Array.isArray(pledgeIds)) {
				pledgeIds = [pledgeIds]
			}

			const theme = Themes.findOne({ _id: themeId })
			if(!theme || !theme.organizations) return 0
			return Organizations.update(
				{ _id: { $in: theme.organizations } },
				{
					$pull: {
						pledges: { _id: { $in: pledgeIds } },
					},
				},
				{ multi: true }
			)
		},
	}),

	/**
	 * Top-off organization
	 */
	topOff: new ValidatedMethod({
		name: "organizations.topOff",

		validate: null,

		run({ id, negate }: TopOffData) {
			negate = negate || false

			let org = Organizations.find({ _id: id }).fetch()[0]
			if(!org) return 0

			let topOffAmount = 0

			if(!negate)	{
				const ask = org.ask || 0
				const amountFromVotes = org.amountFromVotes || 0
				const pledgesTotal = org.pledges?.reduce((sum, pledge) => sum + (pledge.amount || 0), 0) || 0
				topOffAmount = ask - amountFromVotes - pledgesTotal
			}

			return Organizations.update({ _id: id }, { $set: { topOff: topOffAmount } })
		},
	}),

	/**
	 * Reset organization funding totals
	 *
	 */
	reset: new ValidatedMethod({
		name: "organizations.reset",

		validate: null,

		run({ id }: ResetData) {
			return Organizations.update({ _id: id }, {
				$set: {
					pledges: [],
					amountFromVotes: 0,
					topOff: 0,
				},
			})
		},
	}),

}

export default OrganizationMethods

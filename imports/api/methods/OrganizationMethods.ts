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

		async run(data: OrganizationCreateData) {
			try {
				const response = await Organizations.insertAsync(data)
				await Themes.updateAsync({ _id: data.theme }, {
					$push: { organizations: response },
				})
				return { error: undefined, response }
			} catch(error) {
				console.error(error)
				return { error, response: undefined }
			}
		},
	}),

	/**
	 * Update Organization
	 */
	update: new ValidatedMethod({
		name: "organizations.update",

		validate: null,

		async run({ id, data }: OrganizationUpdateData) {
			console.log({ id, data })
			return await Organizations.updateAsync({ _id: id }, { $set: data })
		},
	}),

	/**
	 * Delete Organization
	 */
	remove: new ValidatedMethod({
		name: "organizations.remove",

		validate: null,

		async run(id: string) {
			const org = await Organizations.findOneAsync(id)
			if(org) {
				// First delete any associated images
				if(org.image) {
					await ImageMethods.remove.callAsync({ id: org.image })
				}

				// Remove organization
				try {
					await Organizations.removeAsync(id)
					await Themes.updateAsync({ _id: org.theme }, { $pull: { organizations: id } })
				} catch(err) {
					console.error(err)
					throw err
				}
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

		async run(ids: string[]) {
			// Get list of associated images to remove
			const orgs = await Organizations.find({ _id: { $in: ids }, image: { $exists: true } }, { fields: { _id: 0, image: 1 } }).fetchAsync()
			const images = orgs.map((org) => {
				return org.image
			}).filter((image): image is string => typeof image === "string")

			// Remove the images
			await ImageMethods.removeMany.callAsync({ ids: images })

			// Remove organization
			await Organizations.removeAsync({ _id: { $in: ids } })
		},
	}),


	/**
	 * Add a matched pledge
	 */
	pledge: new ValidatedMethod({
		name: "organizations.pledge",

		validate: null,

		async run({ id, amount, member, anonymous }: PledgeData) {
			amount = roundFloat(String(amount))

			const saveData: MatchPledge = { _id: "", amount, member, anonymous }

			return await Organizations.updateAsync({ _id: id }, {
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

		async run({ orgId, pledgeId }: RemovePledgeData) {
			return await Organizations.updateAsync(
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

		async run({ themeId, pledgeIds }: RemovePledgeByIdData) {
			if(!Array.isArray(pledgeIds)) {
				pledgeIds = [pledgeIds]
			}

			const theme = await Themes.findOneAsync({ _id: themeId })
			if(!theme || !theme.organizations) return 0
			return await Organizations.updateAsync(
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

		async run({ id, negate }: TopOffData) {
			negate = negate || false

			const orgs = await Organizations.find({ _id: id }).fetchAsync()
			const org = orgs[0]
			if(!org) return 0

			let topOffAmount = 0

			if(!negate)	{
				const ask = org.ask || 0
				const amountFromVotes = org.amountFromVotes || 0
				const pledgesTotal = org.pledges?.reduce((sum, pledge) => sum + (pledge.amount || 0), 0) || 0
				topOffAmount = ask - amountFromVotes - pledgesTotal
			}

			return await Organizations.updateAsync({ _id: id }, { $set: { topOff: topOffAmount } })
		},
	}),

	/**
	 * Reset organization funding totals
	 *
	 */
	reset: new ValidatedMethod({
		name: "organizations.reset",

		validate: null,

		async run({ id }: ResetData) {
			return await Organizations.updateAsync({ _id: id }, {
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

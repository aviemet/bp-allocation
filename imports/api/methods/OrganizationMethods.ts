import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Meteor } from "meteor/meteor"

import { crowdFavoriteTopOff } from "/imports/lib/allocation/crowdFavorite"
import { roundFloat } from "/imports/lib/utils"

import { Themes, Organizations, PresentationSettings, MemberThemes, type OrgData } from "/imports/api/db"
import { ImageMethods } from "./ImageMethods"
import { organizationMethodLog as log } from "/imports/lib/logging"
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
	pledgeType?: "standard" | "inPerson"
}

interface RemovePledgeData {
	orgId: string
	pledgeId: string
}

interface RemovePledgeByIdData {
	themeId: string
	pledgeIds: string | string[]
}

interface CrowdFavoriteData {
	id: string
	negate?: boolean
}

interface ResetData {
	id: string
}

export const OrganizationMethods = {
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
			} catch (error) {
				log.error("organizations.create.failure", "Failed to create organization", error, {
					themeId: data.theme,
					meta: { data },
				})
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
				} catch (err) {
					log.error("organizations.remove.failure", "Failed to remove organization", err, {
						themeId: org.theme!,
						meta: { organizationId: id },
					})
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

		async run({ id, amount, member, anonymous, pledgeType = "standard" }: PledgeData) {
			amount = roundFloat(String(amount))

			if(Meteor.isServer) {
				const org = await Organizations.findOneAsync({ _id: id })
				if(!org || !org.theme) {
					throw new Meteor.Error("organizations.pledge.notFound", "Organization not found")
				}

				if(pledgeType === "inPerson") {
					const theme = await Themes.findOneAsync({ _id: org.theme })
					if(!theme?.inPersonPledgeActive) {
						throw new Meteor.Error(
							"organizations.pledge.inPersonNotEnabled",
							"In-person pledges are not enabled for this theme",
						)
					}
				}
			}

			const saveData: MatchPledge = { _id: "", amount, member, anonymous, pledgeType }

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
	 * Fully-fund the crowd favorite organization to its ask amount.
	 *
	 * Designed to be called once, after funds voting closes and before the
	 * pledges round opens. The gap to `ask` is votes, saves, starting funds, and
	 * matched pledge totals (raw pledge + leverage bonus from the shared pool walk),
	 * capped by remaining leverage in the pool.
	 * When `negate` is true, clears the crowd-favorite amount.
	 *
	 * NOTE: writes to the legacy persisted `topOff` field on Organization for
	 * backwards compatibility with existing data.
	 */
	crowdFavorite: new ValidatedMethod({
		name: "organizations.crowdFavorite",

		validate: null,

		async run({ id, negate }: CrowdFavoriteData) {
			if(negate) {
				return await Organizations.updateAsync({ _id: id }, { $set: { topOff: 0 } })
			}

			const org = await Organizations.findOneAsync({ _id: id })
			if(!org?.theme) return 0
			const theme = await Themes.findOneAsync({ _id: org.theme })
			if(!theme) return 0

			const settings = theme.presentationSettings
				? await PresentationSettings.findOneAsync({ _id: theme.presentationSettings })
				: null

			const useKioskFundsVoting = settings?.useKioskFundsVoting ?? false
			const memberThemes = useKioskFundsVoting
				? await MemberThemes.find({ theme: theme._id }).fetchAsync()
				: []

			const rawOrgs = await Organizations.find({ theme: theme._id }).fetchAsync()

			const amount = roundFloat(String(crowdFavoriteTopOff({
				org,
				rawOrgs,
				theme,
				useKioskFundsVoting,
				memberThemes,
			})))
			return await Organizations.updateAsync({ _id: id }, { $set: { topOff: amount } })
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

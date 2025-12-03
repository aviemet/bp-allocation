import { format } from "date-fns"
import { merge } from "lodash"
import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Meteor } from "meteor/meteor"

import { Themes, Organizations, MemberThemes, PresentationSettings, type ThemeData, DEFAULT_NUM_TOP_ORGS } from "/imports/api/db"
import { PledgeAnimationQueue } from "/imports/api/db/PledgeAnimationQueue"
import OrganizationMethods from "./OrganizationMethods"

const ThemeMethods = {
	/**
	 * Create new Theme
	 */
	create: new ValidatedMethod({
		name: "themes.create",

		validate: null,

		async run(data: Partial<ThemeData>) {
			if(!data) return null


			if(!data.quarter) {
				const today = new Date()
				data.quarter = `${format(today, "y")}Q${format(today, "Q")}`
			}

			if(!data.slug) {
				if(!data.title) {
					throw new Meteor.Error("400", "Title is required to generate slug")
				}

				const now = new Date()
				let slug = data.title.split(" ")[0].toLowerCase()
				slug = slug.substring(0, 3)
				let ms = now.getMilliseconds()

				let checkTheme = await Themes.find({ slug: slug + ms }).fetchAsync()
				while(checkTheme.length > 0) {
					ms++
					checkTheme = await Themes.find({ slug: slug + ms }).fetchAsync()
				}

				data.slug = slug + ms
			}

			try {
				const presentationSettingsId = await PresentationSettings.insertAsync({})
				const themeData = merge(data, {
					presentationSettings: presentationSettingsId,
					numTopOrgs: data.numTopOrgs ?? DEFAULT_NUM_TOP_ORGS,
				})
				const theme = await Themes.insertAsync(themeData)
				return theme
			} catch (e) {
				console.error(e)
				return null
			}

		},
	}),

	/**
	 * Update Theme
	 */
	update: new ValidatedMethod({
		name: "themes.update",

		validate: null,

		async run({ id, data }: { id: string, data: Partial<ThemeData> }) {
			try {
				return await Themes.updateAsync({ _id: id }, { $set: data })
			} catch (exception) {
				throw new Meteor.Error("500", String(exception))
			}
		},
	}),

	/**
	 * Remove a Theme
	 */
	remove: new ValidatedMethod({
		name: "themes.remove",

		validate: null,

		async run(id: string) {
			const orgs = await Themes.findOneAsync({ _id: id }, { fields: { organizations: 1 } })

			if(orgs?.organizations && orgs.organizations.length > 0) {
				await OrganizationMethods.removeMany.callAsync(orgs.organizations)
			}
			return await Themes.removeAsync({ _id: id })
		},
	}),

	/**
	 * Manually toggle an organization in to "Top Orgs"
	 */
	topOrgToggle: new ValidatedMethod({
		name: "themes.lockTopOrg",

		validate: null,

		async run({ theme_id, org_id }: { theme_id: string, org_id: string }) {
			const theme = await Themes.findOneAsync({ _id: theme_id }, { fields: { topOrgsManual: 1 } })

			// Remove if exists
			if(theme?.topOrgsManual?.includes(org_id)) {
				return await Themes.updateAsync({ _id: theme_id }, {
					$pull: { topOrgsManual: org_id },
				})
			}
			// Add if not exists
			return await Themes.updateAsync({ _id: theme_id }, {
				$addToSet: { topOrgsManual: org_id },
			})
		},
	}),

	/**
	 * Save an organization by funding 1/2 the ask
	 */
	saveOrg: new ValidatedMethod({
		name: "themes.saveOrg",

		validate: null,

		async run({ id, amount, name }: { id: string, amount: number, name?: string }) {
			if(!id || !amount) return false

			const org = await Organizations.findOneAsync({ _id: id })
			if(!org) return false
			const theme = await Themes.findOneAsync({ _id: org.theme })
			if(!theme) return false

			const data: { org: string, amount: number, name?: string } = { org: id, amount: amount }
			if(name) {
				data.name = name
			}

			const result = await Themes.updateAsync({ _id: theme._id }, {
				$push: {
					saves: {
						$each: [data],
					},
				},
				$inc: { numTopOrgs: 1 },
				$addToSet: { topOrgsManual: id },
			})

			return result
		},
	}),

	/**
	 * Undo a saved Org
	 */
	unSaveOrg: new ValidatedMethod({
		name: "themes.unSaveOrg",

		validate: null,

		async run({ theme_id, org_id }: { theme_id: string, org_id: string }) {
			if(!theme_id || !org_id) return false

			return await Themes.updateAsync({ _id: theme_id }, {
				$pull: {
					saves: { org: org_id },
					topOrgsManual: org_id,
				},
				$inc: { numTopOrgs: -1 },
			})
		},
	}),

	/**
	 * Assign Leverage Funds to Orgs
	 */
	saveLeverageSpread: new ValidatedMethod({
		name: "organizations.saveLeverageSpread",

		validate: null,

		async run(params: {
			orgs: Array<{ _id: string, leverageFunds?: number }>
			themeId: string
			distributionType: "minimum" | "final"
		}) {
			const { orgs, themeId, distributionType = "final" } = params

			await Promise.all(orgs.map(org => {
				return Organizations.updateAsync({ _id: org._id }, {
					$set: {
						leverageFunds: org.leverageFunds || 0,
					},
				})
			}))

			const updateFields: Partial<ThemeData> = {}
			if(distributionType === "minimum") {
				updateFields.minimumLeverageDistributed = true
			} else if(distributionType === "final") {
				updateFields.finalLeverageDistributed = true
			}

			if(Object.keys(updateFields).length > 0) {
				await Themes.updateAsync({ _id: themeId }, { $set: updateFields })
			}
		},
	}),

	/**
	 * Reset Leverage Funds on Orgs to 0
	 */
	resetLeverage: new ValidatedMethod({
		name: "organizations.resetLeverage",

		validate: null,

		async run(themeId: string) {
			const themes = await Themes.find({ _id: themeId }, { fields: { organizations: 1 } }).fetchAsync()
			const theme = themes[0]
			if(!theme) {
				throw new Error("Theme ID does not match records of any Themes")
			}

			const orgs = theme.organizations
			if(!orgs) return []

			await Promise.all(orgs.map((org: string) => {
				return Organizations.updateAsync({ _id: org }, {
					$set: {
						leverageFunds: 0,
					},
				})
			}))

			await Themes.updateAsync({ _id: themeId }, {
				$set: {
					minimumLeverageDistributed: false,
					finalLeverageDistributed: false,
				},
			})
		},
	}),

	resetAllOrgFunds: new ValidatedMethod<string, { organizationsUpdated: number, memberThemesUpdated: number }>({
		name: "organizations.resetAllOrgFunds",

		validate: null,

		async run(themeId: string) {
			const theme = await Themes.findOneAsync({ _id: themeId })
			if(!theme) {
				return {
					organizationsUpdated: 0,
					memberThemesUpdated: 0,
				}
			}
			const organizationsUpdated = await Organizations.updateAsync({ theme: themeId }, {
				$set: {
					amountFromVotes: 0,
					topOff: 0,
					pledges: [],
					leverageFunds: 0,
				},
			}, { multi: true })

			const memberThemesUpdated = await MemberThemes.updateAsync({ theme: themeId }, {
				$set: {
					allocations: [],
					chitVotes: [],
				},
			}, {
				multi: true,
			})

			await PledgeAnimationQueue.removeAsync({ themeId })

			return {
				organizationsUpdated,
				memberThemesUpdated,
			}
		},
	}),

	resetMessageStatus: new ValidatedMethod({
		name: "organizations.resetMessageStatus",

		validate: null,

		async run(themeId: string) {
			await Themes.updateAsync({ _id: themeId }, { $set: { messagesStatus: [] } })
		},
	}),
}

export default ThemeMethods

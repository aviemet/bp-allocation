import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

import { format } from 'date-fns'

import { Themes, Organizations, MemberThemes } from '/imports/api/db'
import OrganizationMethods from './OrganizationMethods'
import PresentationSettingsMethods from './PresentationSettingsMethods'

import { merge } from 'lodash'

const ThemeMethods = {
	/**
	 * Create new Theme
	 */
	create: new ValidatedMethod({
		name: 'themes.create',

		validate: null,

		run(data) {
			if(!data) return null

			if(!data.quarter) {
				const today = new Date()
				data.quarter = `${format(today, 'y')}Q${format(today, 'Q')}`
			}

			if(!data.slug) {
				const now = new Date()
				let slug = data.title.split(' ')[0].toLowerCase()
				slug = slug.substring(0, 3)
				let ms = now.getMilliseconds()

				let checkTheme = Themes.find({ slug: slug + ms }).fetch()
				while(checkTheme.length > 0) {
					ms++
					checkTheme = Themes.find({ slug: slug + ms }).fetch()
				}

				data.slug = slug + ms
			}

			try {
				let theme = Themes.insert(merge(data, { presentationSettings: PresentationSettingsMethods.create.call() }))
				return theme
			} catch (e) {
				console.error(e)
				return null
			}

		}
	}),

	/**
	 * Update Theme
	 */
	update: new ValidatedMethod({
		name: 'themes.update',

		validate: null,

		run({ id, data }) {
			try {
				return Themes.update({ _id: id }, { $set: data })
			} catch(exception) {
				throw new Meteor.Error('500', exception)
			}
		}
	}),

	/**
	 * Remove a Theme
	 */
	remove: new ValidatedMethod({
		name: 'themes.remove',

		validate: null,

		run(id) {
			let orgs = Themes.findOne({ _id: id }, { organizations: 1 })

			if(orgs.organizations && orgs.organizations.length > 0){
				OrganizationMethods.removeMany.call(orgs.organizations)
			}
			return Themes.remove({ _id: id })
		}
	}),

	/**
	 * Manually toggle an organization in to "Top Orgs"
	 */
	topOrgToggle: new ValidatedMethod({
		name: 'themes.lockTopOrg',

		validate: null,

		run({ theme_id, org_id }) {
			let theme = Themes.findOne({ _id: theme_id }, { topOrgsManual: true })

			// Remove if exists
			if(theme.topOrgsManual.includes(org_id)){
				return Themes.update({ _id: theme_id }, {
					$pull: { topOrgsManual: org_id }
				})
			}
			// Add if not exists
			return Themes.update({ _id: theme_id }, {
				$addToSet: { topOrgsManual: org_id }
			})
		}
	}),

	/**
	 * Save an organization by funding 1/2 the ask
	 */
	saveOrg: new ValidatedMethod({
		name: 'themes.saveOrg',

		validate: null,

		run({ id, amount, name }) {
			if(!id || !amount) return false

			let org = Organizations.findOne({ _id: id })
			let theme = Themes.findOne({ _id: org.theme })

			let data = { org: id, amount: amount }
			if(name) {
				data.name = name
			}

			let result = Themes.update({ _id: theme._id }, {
				$push: {
					saves: {
						$each: [data]
					}
				},
				$inc: { numTopOrgs: 1 },
				$addToSet: { topOrgsManual: id }
			})

			return result
		}
	}),

	/**
	 * Undo a saved Org
	 */
	unSaveOrg: new ValidatedMethod({
		name: 'themes.unSaveOrg',

		validate: null,

		run({ theme_id, org_id }) {
			if(!theme_id || !org_id) return false

			return Themes.update({ _id: theme_id }, {
				$pull: {
					saves: { org: org_id },
					topOrgsManual: org_id
				},
				$inc: { numTopOrgs: -1 }
			})
		}
	}),

	/**
	 * Assign Leverage Funds to Orgs
	 */
	saveLeverageSpread: new ValidatedMethod({
		name: 'organizations.saveLeverageSpread',

		validate: null,

		run(orgs) {
			orgs.map(org => {
				Organizations.update({ _id: org._id }, {
					$set: {
						leverageFunds: org.leverageFunds
					}
				})
			})
		}
	}),

	/**
	 * Reset Leverage Funds on Orgs to 0
	 */
	resetLeverage: new ValidatedMethod({
		name: 'organizations.resetLeverage',

		validate: null,

		run(themeId) {
			const theme = Themes.find({ _id: themeId }, { organizations: true }).fetch()[0]
			if(!theme) {
				throw new Error('Theme ID does not match records of any Themes')
			}

			const orgs = theme.organizations

			return orgs.map(org => {
				Organizations.update({ _id: org }, {
					$set: {
						leverageFunds: 0
					}
				})
			})
		}
	}),

	resetAllOrgFunds: new ValidatedMethod({
		name: 'organizations.resetAllOrgFunds',

		validate: null,

		run(themeId) {
			const theme = Themes.find({ _id: themeId }).fetch()[0]

			theme.organizations.forEach(org => {
				OrganizationMethods.update.call({ id: org, data: {
					amountFromVotes: 0,
					topOff: 0,
					pledges: [],
					leverageFunds: 0
				} })
			})

			MemberThemes.update({ theme: themeId }, {
				$set: {
					allocations: [],
					chitVotes: []
				}
			}, {
				multi: true
			})

		}
	}),

	resetMessageStatus: new ValidatedMethod({
		name: 'organizations.resetMessageStatus',

		validate: null,

		run(themeId) {
			Themes.update({ _id: themeId }, { $set: { messagesStatus: [] } })
		}
	})
}

export default ThemeMethods

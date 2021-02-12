import { Meteor } from 'meteor/meteor'
import { observable, action, autorun, toJS } from 'mobx'

import { Themes, PresentationSettings, Organizations, Members } from '/imports/api/db'
import { ThemeStore, OrgsCollection, OrgStore, SettingsStore, MembersCollection, MemberStore } from '/imports/api/stores'

/**
 * Top level Data Store for the application
 */
class DataStore {
	@observable themeId
	@observable loading = true
	@observable sidebarOpen = false
	defaultMenuHeading = 'Battery Powered Allocation Night Themes!'
	@observable menuHeading = this.defaultMenuHeading
	// Set of pledges not to be animated on allocation presentation page
	@observable displayedPledges = new Set()

	KIOSK_PAGES = { info: 'info', chit: 'chit', funds: 'funds', topups: 'topups', results: 'results' }
	votingRedirectTimeout = 60

	theme
	settings
	orgs
	members
	images

	subscriptions = {}
	observers = {}

	@action
	loadData = autorun(() => {
		// Stop the subscriptions and observers which are about to be replaced
		Object.values(this.subscriptions).forEach(subscription => subscription.stop())
		Object.values(this.observers).forEach(observer => observer.stop())

		if(this.themeId) {
			this.loading = true

			let promises = []

			// Subscriptions to data stores

			// Theme
			promises.push(this._themeSubscription().then(theme => {
				if(!theme) {
					this.loading = false
					return
				}

				// Presentation Settings
				promises.push(this._settingsSubscription(theme.presentationSettings))
				// Organizations
				promises.push(this._orgsSubscription())
				// Members
				promises.push(this._membersSubscription(this.themeId).then(members => {

					// Once all subscriptions are loaded and have returned data, set loading to false
					Promise.all(promises).then(values => {
						this.loading = false
					})

				}))

				this.menuHeading = `Battery Powered Allocation Night: ${theme.title}`
			}))
		} else {
			this.loading = true
			this.menuHeading = this.defaultMenuHeading
			this.theme = undefined
			this.settings = undefined
			this.orgs = undefined
			this.members = undefined
			this.images = undefined
		}
	})

	_themeSubscription() {
		return new Promise((resolve, reject) => {

			this.subscriptions.theme = Meteor.subscribe('themes', this.themeId, {
				onReady: () => {
					const themeCursor = Themes.find({ _id: this.themeId })
					const theme = themeCursor.fetch()[0]
					this.theme = theme ? new ThemeStore(theme, this) : null

					this.observers.theme = themeCursor.observe({
						added: theme => this.theme.refreshData(theme),
						changed: theme => this.theme.refreshData(theme)
					})

					resolve(toJS(this.theme))
				}
			})
		})
	}

	_orgsSubscription() {
		return new Promise((resolve, reject) => {

			this.subscriptions.orgs = Meteor.subscribe('organizations', this.themeId, {
				onReady: () => {
					const orgsCursor = Organizations.find({ theme: this.themeId })
					this.orgs = new OrgsCollection(orgsCursor.fetch(), this, OrgStore)

					this.observers.orgs = orgsCursor.observe({
						added: orgs => this.orgs.refreshData(orgs),
						changed: orgs => this.orgs.refreshData(orgs),
						removed: orgs => this.orgs.deleteItem(orgs)
					})

					resolve(toJS(this.orgs))
				}
			})
		})
	}

	_membersSubscription(themeId) {
		return new Promise((resolve, reject) => {
			// Subscribe to Members
			this.subscriptions.members = Meteor.subscribe('members', themeId, {
				onReady: () => {
					const membersCursor = Members.find({ 'theme.theme': themeId })
					const members = membersCursor.fetch()

					this.members = new MembersCollection(members, this, MemberStore)

					this.observers.members = membersCursor.observe({
						added: members => this.members.refreshData(members),
						changed: members => this.members.refreshData(members)
					})

					resolve(toJS(this.members))
				}
			})
		})
	}

	_settingsSubscription(id) {
		return new Promise((resolve, reject) => {

			this.subscriptions.settings = Meteor.subscribe('presentationSettings', id, {
				onReady: () => {
					const settingsCursor = PresentationSettings.find({ _id: id })
					this.settings = new SettingsStore(settingsCursor.fetch()[0], this)

					this.observers.settings = settingsCursor.observe({
						added: settings => this.settings.refreshData(settings),
						changed: settings => this.settings.refreshData(settings)
					})

					resolve(toJS(this.settings))
				}
			})
		})
	}
}

export default DataStore

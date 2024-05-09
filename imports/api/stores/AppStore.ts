import { makeObservable, observable, computed, action, flow } from 'mobx'

/**
 * Top level Data Store for the application
 */
class AppStore {
	_themeId: string | undefined
	loading = true
	sidebarOpen = false
	defaultMenuHeading = 'Battery Powered Allocation Night Themes'
	_menuHeading: string | undefined = this.defaultMenuHeading
	// Set of pledges not to be animated on allocation presentation page
	displayedPledges = new Set()
	loadMembers = true

	// Used to allow only one active editableInput at a time
	openEditor: string | undefined

	KIOSK_PAGES = { info: 'info', chit: 'chit', funds: 'funds', topups: 'topups', results: 'results' }
	defaultVotingRedirectTimeout = 60
	votingRedirectTimeout = this.defaultVotingRedirectTimeout

	constructor() {
		makeObservable(this, {
			_themeId: observable,
			themeId: computed,
			loading: observable,
			sidebarOpen: observable,
			defaultMenuHeading: observable,
			_menuHeading: observable,
			menuHeading: computed,
			displayedPledges: observable,
			loadMembers: observable,
			openEditor: observable,
			defaultVotingRedirectTimeout: observable,
			votingRedirectTimeout: observable,
		})
	}

	get themeId() { return this._themeId }

	set themeId(id: string | undefined) {
		this._themeId = id
	}

	get menuHeading() { return this._menuHeading }
	set menuHeading(heading: string | undefined) {
		this._menuHeading = heading
	}
}

export default AppStore

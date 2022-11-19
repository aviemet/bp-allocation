import { makeAutoObservable } from 'mobx'

/**
 * Top level Data Store for the application
 */
class AppStore {
	themeId: string | undefined
	loading = true
	sidebarOpen = false
	defaultMenuHeading = 'Battery Powered Allocation Night Themes'
	menuHeading = this.defaultMenuHeading
	// Set of pledges not to be animated on allocation presentation page
	displayedPledges = new Set()
	loadMembers = true

	// Used to allow only one active editableInput at a time
	openEditor: string | undefined

	KIOSK_PAGES = { info: 'info', chit: 'chit', funds: 'funds', topups: 'topups', results: 'results' }
	defaultVotingRedirectTimeout = 60
	votingRedirectTimeout = this.defaultVotingRedirectTimeout

	constructor() {
		makeAutoObservable(this, {
			KIOSK_PAGES: false,
		})
	}
}

export default AppStore

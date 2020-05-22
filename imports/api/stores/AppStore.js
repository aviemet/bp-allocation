import { observable } from 'mobx'

/**
 * Top level Data Store for the application
 */
class AppStore {
	@observable themeId
	@observable loading = true
	@observable sidebarOpen = false
	defaultMenuHeading = 'Battery Powered Allocation Night Themes!'
	@observable menuHeading = this.defaultMenuHeading
	// Set of pledges not to be animated on allocation presentation page
	@observable displayedPledges = new Set()
	@observable loadMembers = true

	// Used to allow only one active editableInput at a time
	@observable openEditor

	KIOSK_PAGES = { info: 'info', chit: 'chit', funds: 'funds', topups: 'topups', results: 'results' }
	defaultVotingRedirectTimeout = 60
	@observable votingRedirectTimeout = this.defaultVotingRedirectTimeout
}

export default AppStore
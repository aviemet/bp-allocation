import { observable } from 'mobx';

/**
 * Top level Data Store for the application
 */
class AppStore {
	@observable themeId;
	@observable loading = true;
	@observable sidebarOpen = false;
	defaultMenuHeading = 'Battery Powered Allocation Night Themes!';
	@observable menuHeading = this.defaultMenuHeading;
	// Set of pledges not to be animated on allocation presentation page
	@observable displayedPledges = new Set();
	@observable loadMembers = true;

	KIOSK_PAGES = { info: 'info', chit: 'chit', funds: 'funds', topups: 'topups', results: 'results' };
	votingRedirectTimeout = 60;
}

export default AppStore;
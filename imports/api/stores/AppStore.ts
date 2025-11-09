import { makeAutoObservable } from "mobx"

/**
 * Top level Data Store for the application
 */
class AppStore {
	themeId: string | null = null
	loading = true
	sidebarOpen = false
	defaultMenuHeading = "Battery Powered Allocation Night Themes"
	menuHeading = this.defaultMenuHeading
	loadMembers = true

	// Used to allow only one active editableInput at a time
	openEditor = null

	KIOSK_PAGES = { info: "info", chit: "chit", funds: "funds", topups: "topups", results: "results" } as const
	defaultVotingRedirectTimeout = 60
	votingRedirectTimeout = this.defaultVotingRedirectTimeout

	constructor() {
		makeAutoObservable(this, {
			KIOSK_PAGES: false,
		})
	}

	setThemeId(id: string | null) {
		this.themeId = id
	}

	setMenuHeading(heading: string) {
		this.menuHeading = heading
	}

	setVotingRedirectTimeout(timeout: number) {
		this.votingRedirectTimeout = timeout
	}

	resetVotingRedirectTimeout() {
		this.votingRedirectTimeout = this.defaultVotingRedirectTimeout
	}
}

export default AppStore

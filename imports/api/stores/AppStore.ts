class AppStore {
	themeId: string | null = null
	loading = true
	sidebarOpen = false
	defaultMenuHeading = "Battery Powered Allocation Night Themes"
	menuHeading = this.defaultMenuHeading
	loadMembers = true

	openEditor = null

	KIOSK_PAGES = { info: "info", chit: "chit", funds: "funds", topups: "topups", results: "results" } as const
	defaultVotingRedirectTimeout = 60
	votingRedirectTimeout = this.defaultVotingRedirectTimeout

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

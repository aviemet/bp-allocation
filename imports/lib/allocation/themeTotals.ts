interface ThemeTotalsSlice {
	consolationActive?: boolean
	organizations?: unknown[]
	numTopOrgs?: number
	consolationAmount?: number
	minStartingFundsActive?: boolean
	minStartingFunds?: number
}

/**
 * When consolation is on: dollars set aside from the pledge pool for orgs that are not top orgs — (how many non-top orgs) × consolation per org.
 * Returns how much that eats out of leverage for pledge matching when active; otherwise 0.
 */
export const consolationTotal = (theme: ThemeTotalsSlice): number =>
	theme.consolationActive
		? ((theme.organizations?.length ?? 0) - (theme.numTopOrgs ?? 0)) * (theme.consolationAmount ?? 0)
		: 0

/**
 * When minimum starting funds is on: total dollars for finalists' floor — number of top org slots × minimum per org.
 * Used when figuring how much is left in the pledge pool for matching. Otherwise 0.
 */
export const startingFundsTotal = (theme: ThemeTotalsSlice): number =>
	theme.minStartingFundsActive ? (theme.numTopOrgs ?? 0) * (theme.minStartingFunds ?? 0) : 0

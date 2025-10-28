import { sortBy } from "lodash"

import { Organization, Theme } from "../types/schema"

interface OrganizationWithVotes extends Organization {
	votes?: number
}

interface ThemeWithVoting extends Theme {
	numTopOrgs: number
	topOrgsManual: string[]
}

/**
 * Returns the top orgs after the first round of chit voting
 */
export const sortTopOrgs = (orgs: OrganizationWithVotes[], theme: ThemeWithVoting): OrganizationWithVotes[] => {
	// Save manual top orgs as key/value true/false pairs for reference
	const manualTopOrgs: Record<string, boolean> = {}
	theme.topOrgsManual.forEach((org) => {
		manualTopOrgs[org] = true
	})

	// First sort orgs by weight and vote count
	const sortedOrgs = sortBy(orgs, org => {
		const votes = org.votes || 0
		// Sort in descending order
		return -(votes)
	})

	// Then bubble up the manual top orgs
	// No need to proceed if manual orgs is >= numTopOrgs
	if(theme.numTopOrgs >= theme.topOrgsManual.length) {
		// climb up the bottom of the list looking for manually selected orgs
		for(let i = sortedOrgs.length - 1; i >= theme.numTopOrgs; i--) {

			// Check if the org has been manually selected
			if(manualTopOrgs[sortedOrgs[i]._id]) {
				// Find the closest automatically selected top org
				let j = i - 1
				while(j > 0 && manualTopOrgs[sortedOrgs[j]._id]) {
					j--
				}

				// Start swapping the auto top org down the list
				while(j < i) {
					const tmp = sortedOrgs[i]
					sortedOrgs[i] = sortedOrgs[j]
					sortedOrgs[j] = tmp

					j++
				}

				// Send the index back one in case we swapped another match into previous place
				i++
			}
		}
	}

	return sortedOrgs
}

/**
 * Returns the number of top orgs in the theme
 */
export const getNumTopOrgs = (theme: ThemeWithVoting): number =>
	theme.numTopOrgs >= theme.topOrgsManual.length ? theme.numTopOrgs : theme.topOrgsManual.length

/**
 * Gets the top x orgs by chitvote, with saves and manual locks considered
 * where x is the number of top orgs for the theme
 */
export const filterTopOrgs = (orgs: OrganizationWithVotes[], theme: ThemeWithVoting): OrganizationWithVotes[] => {
	const sortedOrgs = sortTopOrgs(orgs, theme)
	return sortedOrgs.slice(0, getNumTopOrgs(theme))
}

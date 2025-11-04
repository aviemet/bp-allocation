import { sortBy } from "lodash"

import { Organization, Theme } from "../types/schema"

interface OrganizationWithVotes extends Organization {
	votes?: number
}

interface ThemeWithVoting extends Theme {
	numTopOrgs: number
	topOrgsManual: string[]
}

export const sortTopOrgs = <T extends Organization>(orgs: T[], theme: ThemeWithVoting): T[] => {
	const manualTopOrgs: Record<string, boolean> = {}
	theme.topOrgsManual.forEach((org) => {
		manualTopOrgs[org] = true
	})

	const sortedOrgs = sortBy(orgs, org => {
		const votes = "votes" in org && typeof org.votes === "number" ? org.votes : 0
		return -(votes)
	})

	if(theme.numTopOrgs >= theme.topOrgsManual.length) {
		for(let i = sortedOrgs.length - 1; i >= theme.numTopOrgs; i--) {
			if(manualTopOrgs[sortedOrgs[i]._id]) {
				let j = i - 1
				while(j > 0 && manualTopOrgs[sortedOrgs[j]._id]) {
					j--
				}

				while(j < i) {
					const tmp = sortedOrgs[i]
					sortedOrgs[i] = sortedOrgs[j]
					sortedOrgs[j] = tmp
					j++
				}

				i++
			}
		}
	}

	return sortedOrgs
}

export const getNumTopOrgs = (theme: ThemeWithVoting): number => {
	return theme.numTopOrgs >= theme.topOrgsManual.length ? theme.numTopOrgs : theme.topOrgsManual.length
}

export const filterTopOrgs = <T extends Organization>(orgs: T[], theme: ThemeWithVoting): T[] => {
	const sortedOrgs = sortTopOrgs(orgs, theme)
	return sortedOrgs.slice(0, getNumTopOrgs(theme))
}

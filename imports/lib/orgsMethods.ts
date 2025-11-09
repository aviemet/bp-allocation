import { sortBy } from "lodash"

import { Organization, Theme } from "../types/schema"

type ThemeVotingFields = Pick<Theme, "numTopOrgs" | "topOrgsManual">

export interface ThemeVotingConfig {
	numTopOrgs: number
	topOrgsManual: string[]
}

export const createThemeVotingConfig = (theme?: ThemeVotingFields): ThemeVotingConfig => {
	if(!theme) {
		return {
			numTopOrgs: 0,
			topOrgsManual: [],
		}
	}

	return {
		numTopOrgs: theme.numTopOrgs ?? 0,
		topOrgsManual: theme.topOrgsManual ?? [],
	}
}

export const sortTopOrgs = <T extends Organization>(orgs: T[], theme?: ThemeVotingFields): T[] => {
	const votingConfig = createThemeVotingConfig(theme)
	const manualTopOrgs = votingConfig.topOrgsManual.reduce<Record<string, boolean>>((acc, orgId) => {
		acc[orgId] = true
		return acc
	}, {})

	const sortedOrgs = sortBy(orgs, org => {
		const votes = "votes" in org && typeof org.votes === "number" ? org.votes : 0
		return -(votes)
	})

	if(votingConfig.numTopOrgs >= votingConfig.topOrgsManual.length) {
		for(let i = sortedOrgs.length - 1; i >= votingConfig.numTopOrgs; i--) {
			if(manualTopOrgs[sortedOrgs[i]._id]) {
				let j = i - 1
				while(j > 0 && manualTopOrgs[sortedOrgs[j]._id]) {
					j--
				}

				while(j < i) {
					const swap = sortedOrgs[i]
					sortedOrgs[i] = sortedOrgs[j]
					sortedOrgs[j] = swap
					j++
				}

				i++
			}
		}
	}

	return sortedOrgs
}

export const getNumTopOrgs = (theme?: ThemeVotingFields): number => {
	const votingConfig = createThemeVotingConfig(theme)
	return votingConfig.numTopOrgs >= votingConfig.topOrgsManual.length ? votingConfig.numTopOrgs : votingConfig.topOrgsManual.length
}

export const filterTopOrgs = <T extends Organization>(orgs: T[], theme?: ThemeVotingFields): T[] => {
	const sortedOrgs = sortTopOrgs(orgs, theme)
	return sortedOrgs.slice(0, getNumTopOrgs(theme))
}

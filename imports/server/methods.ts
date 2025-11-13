import { sortBy } from "lodash"
import { createThemeVotingConfig } from "/imports/lib/orgsMethods"
import { type Theme } from "/imports/types/schema"

type ThemeVotingFields = Pick<Theme, "numTopOrgs" | "topOrgsManual">

/**
 * Sets Meteor publication callback events to transform data
 * @param {*} transformer
 */
export interface PublishSelf {
	added: (title: string, id: string, fields: Record<string, unknown>) => void
	changed: (title: string, id: string, fields: Record<string, unknown>) => void
	removed: (title: string, id: string) => void
	onStop: (fn: () => void) => void
	ready: () => void
}

type Transformer<TDoc extends { _id: string }, TParams> = (doc: TDoc, params: TParams) => Record<string, unknown>
type ObserverFactory<TDoc extends { _id: string }, TParams> = (title: string, self: PublishSelf, params: TParams) => {
	added: (doc: TDoc) => unknown
	changed: (newDoc: TDoc) => unknown
	removed: (oldDoc: TDoc) => unknown
}
type RegisterObserver = <TDoc extends { _id: string }, TParams>(transformer: Transformer<TDoc, TParams>) => ObserverFactory<TDoc, TParams>

export const registerObserver: RegisterObserver = (transformer) => (title, self, params) => {
	return {
		added: (doc) => {
			// console.log({ doc })
			return self.added(title, doc._id, transformer(doc, params))
		},
		changed: (newDoc) => {
			// console.log({ newDoc })
			return self.changed(title, newDoc._id, transformer(newDoc, params))
		},
		removed: (oldDoc) => {
			// console.log({ oldDoc })
			return self.removed(title, oldDoc._id)
		},
	}
}

/**
 * Returns the top orgs after the first round of chit voting
 * @param {*} orgs
 * @param {*} theme
 */
export const sortTopOrgs = (orgs: { _id: string, votes: number }[], theme?: ThemeVotingFields) => {
	// Save manual top orgs as key/value true/false pairs for reference
	const votingConfig = createThemeVotingConfig(theme)
	const manualTopOrgs = votingConfig.topOrgsManual.reduce<Record<string, boolean>>((acc, orgId) => {
		acc[orgId] = true
		return acc
	}, {})

	// First sort orgs by weight and vote count
	const sortedOrgs = sortBy(orgs, org => {
		// Sort in descending order
		return -(org.votes)
	})

	// Then bubble up the manual top orgs
	// No need to proceed if manual orgs is >= numTopOrgs
	if(votingConfig.numTopOrgs >= votingConfig.topOrgsManual.length) {
		// climb up the bottom of the list looking for manually selected orgs
		for(let i = sortedOrgs.length - 1; i >= votingConfig.numTopOrgs; i--) {
			// Check if the org has been manually selected
			if(manualTopOrgs[sortedOrgs[i]._id]) {
				// Find the closest automatically selected top org
				let j = i - 1
				while(j > 0 && manualTopOrgs[sortedOrgs[j]._id]) {
					j--
				}

				// Start swapping the auto top org down the list
				while(j < i) {
					const swap = sortedOrgs[i]
					sortedOrgs[i] = sortedOrgs[j]
					sortedOrgs[j] = swap
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
 * @param {*} theme
 */
export const getNumTopOrgs = (theme?: ThemeVotingFields) => {
	const votingConfig = createThemeVotingConfig(theme)
	return votingConfig.numTopOrgs >= votingConfig.topOrgsManual.length ? votingConfig.numTopOrgs : votingConfig.topOrgsManual.length
}

/**
 * Gets the top x orgs by chitvote, with saves and manual locks considered
 * where x is the number of top orgs for the theme
 * @param {*} orgs
 * @param {*} theme
 */
export const filterTopOrgs = (orgs: { _id: string, votes: number }[], theme?: ThemeVotingFields) => {
	const sortedOrgs = sortTopOrgs(orgs, theme)
	return sortedOrgs.slice(0, getNumTopOrgs(theme))
}

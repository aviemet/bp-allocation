import { sortBy } from "lodash"
import { computed, makeObservable } from "mobx"

import TrackableCollection from "./lib/TrackableCollection"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import OrgStore from "./OrgStore"
import { Theme, MatchPledge } from "/imports/types/schema"
import { OrgData } from "/imports/api/db"

interface ThemeWithVoting extends Theme {
	numTopOrgs: number
	topOrgsManual: string[]
}

class OrgsCollection extends TrackableCollection<OrgStore> {
	private _theme: Theme

	// Cache list of pre-existing pledges to prevent animating stale data
	constructor(data: OrgData[], theme: Theme, Store: typeof OrgStore) {
		super(data, Store)

		makeObservable(this, {
			pledges: computed,
		})

		this._theme = theme
	}

	/**
	 * Queue for displaying pledges on screen
	 */
	get pledges() {
		let pledges: Array<MatchPledge & { org: { _id: string, title: string } }> = []

		if(!this._theme.numTopOrgs || !this._theme.topOrgsManual) {
			return pledges
		}

		const themeWithVoting: ThemeWithVoting = {
			...this._theme,
			numTopOrgs: this._theme.numTopOrgs,
			topOrgsManual: this._theme.topOrgsManual || [],
		}

		const topOrgs = filterTopOrgs(this.values, themeWithVoting)
		topOrgs.forEach(org => {
			org.pledges?.forEach((pledge: MatchPledge) => {
				if(org.title) {
					pledges.push(Object.assign({
						org: {
							_id: org._id,
							title: org.title,
						},
					}, pledge))
				}
			})
		})
		pledges = sortBy(pledges, ["createdAt"])
		return pledges
	}
}

export default OrgsCollection

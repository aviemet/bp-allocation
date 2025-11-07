import { sortBy } from "lodash"
import { computed, makeObservable } from "mobx"

import TrackableCollection from "./lib/TrackableCollection"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import OrgStore from "./OrgStore"
import { Theme, MatchPledge } from "/imports/types/schema"
import { OrgData } from "/imports/api/db"

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

		const topOrgs = filterTopOrgs(this.values, this._theme)
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

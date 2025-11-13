import { sortBy } from "lodash"

import TrackableCollection from "./lib/TrackableCollection"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import OrgStore from "./OrgStore"
import { Theme, MatchPledge } from "/imports/types/schema"
import { OrgData } from "/imports/api/db"

export interface PledgeWithOrg extends MatchPledge {
	org: {
		_id: string
		title: string
	}
	[key: string]: unknown
}

class OrgsCollection extends TrackableCollection<OrgStore> {
	private _theme: Theme

	constructor(data: OrgData[], theme: Theme, Store: typeof OrgStore) {
		super(data, Store)
		this._theme = theme
	}

	get pledges(): PledgeWithOrg[] {
		let pledges: PledgeWithOrg[] = []

		const topOrgs = filterTopOrgs(this.values, this._theme)
		topOrgs.forEach(org => {
			org.pledges?.forEach((pledge: MatchPledge) => {
				if(org.title) {
					pledges.push({
						...pledge,
						org: {
							_id: org._id,
							title: org.title,
						},
					})
				}
			})
		})
		pledges = sortBy(pledges, ["createdAt"])
		return pledges
	}
}

export default OrgsCollection

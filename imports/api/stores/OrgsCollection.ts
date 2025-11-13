import TrackableCollection from "./lib/TrackableCollection"
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
		return (this._theme.pledges || []) as PledgeWithOrg[]
	}
}

export default OrgsCollection

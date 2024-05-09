import TrackableCollection from './lib/TrackableCollection'
import { computed, makeObservable } from 'mobx'
import { sortBy } from 'lodash'
import { filterTopOrgs } from '/imports/lib/orgsMethods'
import OrgStore from './OrgStore'

class OrgsCollection extends TrackableCollection<Schema.Organization> {
	_theme: Schema.Theme

	// Cache list of pre-existing pledges to prevent animating stale data
	constructor(data: Schema.Organization[], theme: Schema.Theme) {
		super(data, OrgStore)

		makeObservable(this, {
			pledges: computed,
		})

		this._theme = theme
	}

	/**
	 * Queue for displaying pledges on screen
	 */
	get pledges() {
		let pledges: Schema.MatchPledge[] = []

		const topOrgs = filterTopOrgs(this.values, this._theme)
		topOrgs.forEach((org: Schema.Organization) => {
			org.pledges.forEach(pledge => {
				pledges.push(
					Object.assign(
						{
							org: {
								_id: org._id,
								title: org.title,
							},
						},
						pledge,
					),
				)
			})
		})
		pledges = sortBy(pledges, ['createdAt'])
		return pledges
	}
}

export default OrgsCollection

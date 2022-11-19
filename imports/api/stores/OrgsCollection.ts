import TrackableCollection from './lib/TrackableCollection'
import { computed, makeObservable } from 'mobx'
import { sortBy } from 'lodash'
import { filterTopOrgs } from '/imports/lib/orgsMethods'
import TrackableStore from './lib/TrackableStore'

class OrgsCollection extends TrackableCollection<Organization> {
	_theme: Theme

	// Cache list of pre-existing pledges to prevent animating stale data
	constructor(data: Organization[], theme: Theme, Store: TrackableStore<Organization>) {
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
		let pledges: MatchPledge[] = []

		const topOrgs = filterTopOrgs(this.values, this._theme)
		topOrgs.forEach(org => {
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

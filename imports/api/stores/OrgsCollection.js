import TrackableCollection from './lib/TrackableCollection'
import { computed } from 'mobx'
import { sortBy } from 'lodash'
import { filterTopOrgs } from '/imports/lib/orgsMethods'

class OrgsCollection extends TrackableCollection {

	// Cache list of pre-existing pledges to prevent animating stale data
	constructor(data, theme, Store) {
		super(data, Store)
		this._theme = theme
	}

	/**
	 * Queue for displaying pledges on screen
	 */
	@computed
	get pledges() {
		let pledges = []
		const topOrgs = filterTopOrgs(this.values, this._theme)
		topOrgs.forEach(org => {
			org.pledges.forEach(pledge => {
				pledges.push(Object.assign({
					org: {
						_id: org._id,
						title: org.title
					}
				}, pledge))
			})
		})
		pledges = sortBy(pledges, ['createdAt'])
		return pledges
	}
}

export default OrgsCollection
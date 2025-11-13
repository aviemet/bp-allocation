import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { useData } from "../providers/DataProvider"
import { useTheme } from "./useTheme"
import { Organizations, type OrgData } from "../db"
import { type MatchPledge } from "/imports/types/schema"

export interface PledgeWithOrg extends MatchPledge {
	org: {
		_id: string
		title: string
	}
	[key: string]: unknown
}

export const useOrgs = () => {
	const data = useData()
	const themeId = data?.themeId
	const { theme, themeLoading } = useTheme()

	return useTracker(() => {
		if(!themeId || themeLoading || !theme) {
			return {
				orgs: [] as OrgData[],
				topOrgs: [] as OrgData[],
				pledges: [] as PledgeWithOrg[],
				orgsLoading: true,
			}
		}

		const subscription = Meteor.subscribe("organizations", themeId)
		const subscriptionReady = subscription.ready()
		const orgs = Organizations.find({ theme: themeId }).fetch()

		if(!subscriptionReady) {
			return {
				orgs: [] as OrgData[],
				topOrgs: [] as OrgData[],
				pledges: [] as PledgeWithOrg[],
				orgsLoading: true,
			}
		}

		const topOrgIds = theme.topOrgs || []
		const topOrgs = topOrgIds.map(id => orgs.find(org => org._id === id)).filter((org): org is OrgData => org !== undefined)
		const pledges = (theme.pledges || []) as PledgeWithOrg[]

		return {
			orgs,
			topOrgs,
			pledges,
			orgsLoading: false,
		}
	}, [themeId, themeLoading, theme])
}


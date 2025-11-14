import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { useTheme } from "./useTheme"
import { Organizations, type OrgData } from "../db"
import { useData } from "../providers/DataProvider"
import { type MatchPledge, type Organization } from "/imports/types/schema"

export interface PledgeWithOrg extends MatchPledge {
	org: {
		_id: string
		title: string
	}
	[key: string]: unknown
}

export interface OrganizationWithComputed extends Organization {
	votedTotal: number
	allocatedFunds: number
	pledgeTotal: number
	save: number
	need: number
	leverageFunds: number
	topOff: number
	amountFromVotes: number
	ask: number
	votes: number
}

export type OrgDataWithComputed = OrgData & OrganizationWithComputed

export const useOrgs = () => {
	const data = useData()
	const themeId = data?.themeId
	const { theme, themeLoading } = useTheme()

	return useTracker((): {
		orgs: OrgDataWithComputed[]
		topOrgs: OrgDataWithComputed[]
		pledges: PledgeWithOrg[]
		orgsLoading: boolean
	} => {
		if(!themeId || themeLoading || !theme) {
			return {
				orgs: [],
				topOrgs: [],
				pledges: [],
				orgsLoading: true,
			}
		}

		const subscription = Meteor.subscribe("organizations", themeId)
		const subscriptionReady = subscription.ready()
		const orgsRaw = Organizations.find({ theme: themeId }).fetch()

		if(!subscriptionReady) {
			return {
				orgs: [],
				topOrgs: [],
				pledges: [],
				orgsLoading: true,
			}
		}

		function hasComputedProperties(org: OrgData): org is OrgDataWithComputed {
			return (
				"votedTotal" in org && typeof org.votedTotal === "number" &&
				"allocatedFunds" in org && typeof org.allocatedFunds === "number" &&
				"need" in org && typeof org.need === "number"
			)
		}

		const orgs = orgsRaw.filter(hasComputedProperties)
		const topOrgIds = theme.topOrgs || []
		const topOrgs = topOrgIds.map(id => orgs.find(org => org._id === id)).filter((org): org is OrgDataWithComputed => org !== undefined)
		const pledges = (theme.pledges || [])

		return {
			orgs,
			topOrgs,
			pledges,
			orgsLoading: false,
		}
	}, [themeId, themeLoading, theme])
}


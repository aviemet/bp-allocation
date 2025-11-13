import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { sortBy } from "lodash"

import { useData } from "../providers/DataProvider"
import { useTheme } from "./useTheme"
import { Organizations, type OrgData } from "../db"
import { filterTopOrgs } from "/imports/lib/orgsMethods"
import { type Organization, type MatchPledge, type Theme } from "/imports/types/schema"

export interface PledgeWithOrg extends MatchPledge {
	org: {
		_id: string
		title: string
	}
	[key: string]: unknown
}

const computePledges = (orgs: Organization[], theme?: Pick<Theme, "numTopOrgs" | "topOrgsManual">): PledgeWithOrg[] => {
	let pledges: PledgeWithOrg[] = []

	const topOrgs = filterTopOrgs(orgs, theme)
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

export const useOrgs = () => {
	const data = useData()
	const themeId = data?.themeId
	const { theme, isLoading: themeLoading } = useTheme()

	return useTracker(() => {
		if(!themeId || themeLoading || !theme) {
			return {
				values: [] as OrgData[],
				topOrgs: [] as OrgData[],
				pledges: [] as PledgeWithOrg[],
				isLoading: true,
			}
		}

		const subscription = Meteor.subscribe("organizations", themeId)
		const subscriptionReady = subscription.ready()
		const orgs = Organizations.find({ theme: themeId }).fetch()

		if(!subscriptionReady) {
			return {
				values: [] as OrgData[],
				topOrgs: [] as OrgData[],
				pledges: [] as PledgeWithOrg[],
				isLoading: true,
			}
		}

		const topOrgs = filterTopOrgs(orgs, theme)
		const pledges = computePledges(orgs, theme)

		return {
			values: orgs,
			topOrgs,
			pledges,
			isLoading: false,
		}
	}, [themeId, themeLoading, theme])
}


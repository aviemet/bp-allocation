import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { OrgPledgeFunding } from "../db"
import { useData } from "../providers/DataProvider"

export const usePledgeOrgFunding = () => {
	const data = useData()
	const themeId = data?.themeId

	return useTracker((): {
		fundingByOrgId: Record<string, number>
		fundingLoading: boolean
	} => {
		if(!themeId) {
			return {
				fundingByOrgId: {},
				fundingLoading: true,
			}
		}

		const subscription = Meteor.subscribe("organizations.pledgeFunding", themeId)
		if(!subscription.ready()) {
			return {
				fundingByOrgId: {},
				fundingLoading: true,
			}
		}

		const fundingByOrgId: Record<string, number> = {}
		OrgPledgeFunding.find({ theme: themeId }).forEach(row => {
			fundingByOrgId[row._id] = row.need
		})

		return {
			fundingByOrgId,
			fundingLoading: false,
		}
	}, [themeId])
}

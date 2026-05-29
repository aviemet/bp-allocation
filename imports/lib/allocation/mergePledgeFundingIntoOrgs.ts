import { type OrgDataWithComputed } from "/imports/api/hooks/useOrgs"

export const mergePledgeFundingIntoOrgs = (
	orgs: OrgDataWithComputed[],
	fundingByOrgId: Record<string, number>,
): OrgDataWithComputed[] =>
	orgs.map(org => {
		const liveNeed = fundingByOrgId[org._id]
		if(liveNeed === undefined) return org

		return { ...org, need: liveNeed }
	})

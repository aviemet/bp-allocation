import { useMemo } from "react"

import { mergePledgeFundingIntoOrgs } from "/imports/lib/allocation/mergePledgeFundingIntoOrgs"

import { type OrgDataWithComputed } from "./useOrgs"
import { usePledgeOrgFunding } from "./usePledgeOrgFunding"

export const usePledgeFormOrgs = (
	staticTopOrgs: OrgDataWithComputed[],
	staticOrgs: OrgDataWithComputed[] = [],
) => {
	const { fundingByOrgId, fundingLoading } = usePledgeOrgFunding()

	const topOrgs = useMemo(
		() => mergePledgeFundingIntoOrgs(staticTopOrgs, fundingByOrgId),
		[staticTopOrgs, fundingByOrgId],
	)

	const orgs = useMemo(
		() => mergePledgeFundingIntoOrgs(staticOrgs, fundingByOrgId),
		[staticOrgs, fundingByOrgId],
	)

	const remainingOrgs = useMemo(() => {
		const topOrgIds = new Set(topOrgs.map(org => org._id))
		return orgs.filter(org => !topOrgIds.has(org._id))
	}, [orgs, topOrgs])

	return {
		topOrgs,
		orgs,
		remainingOrgs,
		fundingLoading,
	}
}

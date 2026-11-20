import { Container, Typography } from "@mui/material"
import { isEmpty } from "es-toolkit/compat"

import { useMembers, usePledgeFormOrgs } from "/imports/api/hooks"
import { useStaticOrgs } from "/imports/api/hooks/static"
import { PledgesForm } from "./PledgesForm"

import { Loading } from "/imports/ui/components"

export const Pledges = () => {
	const { members, membersLoading } = useMembers()
	const { orgs: staticOrgs, topOrgs: staticTopOrgs, orgsLoading } = useStaticOrgs()
	const { topOrgs, remainingOrgs } = usePledgeFormOrgs(staticTopOrgs, staticOrgs)

	if(membersLoading || isEmpty(members) || orgsLoading) return <Loading />
	return (
		<Container>
			<Typography component="h1" variant="h2" align="center">Top-ups</Typography>

			<PledgesForm topOrgs={ topOrgs } remainingOrgs={ remainingOrgs } />
		</Container>
	)
}

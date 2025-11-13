import { Container, Typography } from "@mui/material"
import { isEmpty } from "lodash"
import { useMembers, useOrgs } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"
import { Form } from "/imports/ui/components/Form"

import { Loading } from "/imports/ui/components"
import PledgesForm from "./PledgesForm"

const Pledges = () => {
	const { members, membersLoading } = useMembers()
	const { orgsLoading } = useOrgs()

	const handleSubmit = async (data: Record<string, unknown>, { reset }: { reset: () => void }) => {
		try {
			const res = await OrganizationMethods.pledge.callAsync({
				id: String(data.id || ""),
				amount: Number(data.amount || 0),
				member: String(data.member || ""),
				anonymous: Boolean(data.anonymous),
			})
			if(res) {
				reset()
			}
		} catch (err) {
			console.error(err)
		}
	}

	if(membersLoading || isEmpty(members) || orgsLoading) return <Loading />
	return (
		<Container>
			<Typography component="h1" variant="h2" align="center">Top-ups</Typography>

			<Form
				defaultValues={ {
					id: "",
					amount: "",
					member: "",
					anonymous: false,
				} }
				onValidSubmit={ handleSubmit }
			>

				<PledgesForm />

			</Form>
		</Container>
	)
}

export default Pledges

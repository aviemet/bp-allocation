import { Container, Typography } from "@mui/material"
import { isEmpty } from "lodash"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMembers, useOrgs } from "/imports/api/providers"
import { OrganizationMethods } from "/imports/api/methods"
import { Form } from "/imports/ui/components/Form"

import { Loading } from "/imports/ui/components"
import PledgesForm from "./PledgesForm"

const Pledges = observer(() => {
	const { members, isLoading: membersLoading } = useMembers()
	const { isLoading: orgsLoading } = useOrgs()

	const handleSubmit = (data, { reset }) => {
		OrganizationMethods.pledge.call({
			...data,
		}, (err, res) => {
			if(err) {
				console.error(err)
			} else if(res) {
				reset()
			}
		})
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
})

export default Pledges

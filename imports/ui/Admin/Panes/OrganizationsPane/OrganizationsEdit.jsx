import React from 'react'
import { Link, useParams, useHistory } from 'react-router-dom'
import { useOrgs } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'
import { OrganizationSchema } from '/imports/api/db/schema'

import { Form, TextInput, RichTextInput } from '/imports/ui/Components/Form'

import {
	Button,
	Container,
	Grid,
	InputAdornment,
	Stack,
	Typography,
} from '@mui/material'

const OrganizationsEdit = () => {
	const { orgs } = useOrgs()

	const { id, orgId } = useParams()
	const history = useHistory()

	const org = orgs?.values.find(org => org._id === orgId) || {
		theme: id,
		title: '',
		ask: '',
		description: ''
	}

	const sanitizeData = data => {
		const sanitizedData = data
		sanitizedData.ask = sanitizedData.ask ? parseFloat(sanitizedData.ask.replace(/[^\d.]/g, '')) : undefined
		return sanitizedData
	}

	const onSubmit = data => {
		let response
		if(orgId) {
			response = OrganizationMethods.update.call({ id: orgId, data })
		} else {
			response = OrganizationMethods.create.call(data)
		}
		if(response) {
			history.push(`/admin/${id}/orgs`)
		} else {
			console.error({ response })
		}
	}

	return (
		<Container>
			<Typography component="h1" variant="h3" sx={ { mb: 1 } }>
				{ orgId ? 'Edit' : 'New' } Organization
			</Typography>

			<Form
				schema={ OrganizationSchema }
				defaultValues={ org }
				onValidSubmit={ onSubmit }
				onSanitize={ sanitizeData }
			>
				<Grid container spacing={ 2 }>
					<Grid item xs={ 12 } md={ 8 }>
						<TextInput name="title" label="Organization Title" required />
					</Grid>

					<Grid item xs={ 12 } md={ 4 }>
						<TextInput name="ask" label="Funding Ask" required inputProps={ {
							startAdornment: <InputAdornment position="start">$</InputAdornment>,
						} }/>
					</Grid>

					<Grid item xs={ 12 }>
						<RichTextInput name="description" label="Description" />
					</Grid>

					<Grid item xs={ 12 }>
						<Stack direction="row" spacing={ 2 } justifyContent="end">
							<Button as={ Link } to={ `/admin/${id}/orgs` }>Cancel</Button>
							<Button type="submit">Submit</Button>
						</Stack>
					</Grid>

				</Grid>
			</Form>
		</Container>
	)
}

export default OrganizationsEdit

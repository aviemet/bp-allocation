import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Link } from '/imports/ui/Components'
import { useOrgs, useTheme } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'
import { OrganizationSchema } from '/imports/api/db/schema'
import { Form, TextInput, RichTextInput, SubmitButton, STATUS } from '/imports/ui/Components/Form'
import {
	Button,
	Container,
	Grid,
	InputAdornment,
	Stack,
	Typography,
} from '@mui/material'
import useParams from '/imports/lib/hooks/useParams'

const OrganizationsEdit = () => {
	const { theme } = useTheme()
	const { orgs } = useOrgs()

	const { orgId } = useParams()
	const [location, setLocation] = useLocation()

	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const orgStore = orgs?.values.find(org => org._id === orgId)
	const org = {
		theme: theme._id,
		title: orgStore?.title || '',
		ask: orgStore?.ask || '',
		description: orgStore?.description || '',
	}

	const sanitizeData = data => {
		const sanitizedData = data
		if(typeof sanitizedData.ask === 'string') {
			sanitizedData.ask = parseFloat(sanitizedData.ask.replace(/[^\d.]/g, ''))
		}
		return sanitizedData
	}

	const onSubmit = (data) => {
		setFormStatus(STATUS.SUBMITTING)
		let response
		if(orgId) {
			response = OrganizationMethods.update.call({ id: orgId, data })
		} else {
			response = OrganizationMethods.create.call(data)
		}

		if(response) {
			setFormStatus(STATUS.SUCCESS)
		} else {
			setFormStatus(STATUS.ERROR)
			console.error({ response })
		}
	}

	useEffect(() => {
		if(formStatus === STATUS.SUCCESS) {
			setTimeout(() => setLocation(`/admin/${theme._id}/orgs`), 1000)
		}
	}, [formStatus])

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
						<TextInput
							name="title"
							label="Organization Title"
							required
						/>
					</Grid>

					<Grid item xs={ 12 } md={ 4 }>
						<TextInput
							name="ask"
							label="Funding Ask"
							required
							inputProps={ {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							} }
						/>
					</Grid>

					<Grid item xs={ 12 }>
						<RichTextInput name="description" label="Description" />
					</Grid>

					<Grid item xs={ 12 }>
						<Stack direction="row" spacing={ 2 } justifyContent="end">
							<Link to={ `/admin/${theme._id}/orgs` }><Button color="error">Cancel</Button></Link>
							<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Organization</SubmitButton>
						</Stack>
					</Grid>

				</Grid>
			</Form>
		</Container>
	)
}

export default OrganizationsEdit

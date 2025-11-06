import {
	Button,
	Container,
	Grid,
	InputAdornment,
	Stack,
	Typography,
} from "@mui/material"
import { Link, useParams, useNavigate } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { useOrgs } from "/imports/api/providers"
import { OrganizationMethods } from "/imports/api/methods"
import { OrganizationSchema } from "/imports/api/db"

import { Form, TextInput, RichTextInput, SubmitButton, STATUS } from "/imports/ui/components/Form"


const OrganizationsEdit = () => {
	const { orgs } = useOrgs()

	const { id, orgId } = useParams()
	const history = useHistory()

	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const orgStore = orgs?.values.find(org => org._id === orgId)
	const org = {
		theme: id,
		title: orgStore?.title || "",
		ask: orgStore?.ask || "",
		description: orgStore?.description || "",
	}

	const sanitizeData = data => {
		const sanitizedData = data
		if(typeof sanitizedData.ask === "string") {
			sanitizedData.ask = parseFloat(sanitizedData.ask.replace(/[^\d.]/g, ""))
		}
		return sanitizedData
	}

	const onSubmit = async data => {
		setFormStatus(STATUS.SUBMITTING)
		try {
			let response
			if(orgId) {
				response = await OrganizationMethods.update.callAsync({ id: orgId, data })
			} else {
				response = await OrganizationMethods.create.callAsync(data)
			}

			if(response) {
				setFormStatus(STATUS.SUCCESS)
			} else {
				setFormStatus(STATUS.ERROR)
				console.error({ response })
			}
		} catch(error) {
			setFormStatus(STATUS.ERROR)
			console.error({ error })
		}
	}

	useEffect(() => {
		if(formStatus === STATUS.SUCCESS) {
			setTimeout(() => history.push(`/admin/${id}/orgs`), 1000)
		}
	}, [formStatus])

	return (
		<Container>
			<Typography component="h1" variant="h3" sx={ { mb: 1 } }>
				{ orgId ? "Edit" : "New" } Organization
			</Typography>

			<Form
				schema={ OrganizationSchema }
				defaultValues={ org }
				onValidSubmit={ onSubmit }
				onSanitize={ sanitizeData }
			>
				<Grid container spacing={ 2 }>
					<Grid size={ { xs: 12, md: 8 } }>
						<TextInput
							name="title"
							label="Organization Title"
							required
						/>
					</Grid>

					<Grid size={ { xs: 12, md: 4 } }>
						<TextInput
							name="ask"
							label="Funding Ask"
							required
							InputProps={ {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							} }
						/>
					</Grid>

					<Grid size={ { xs: 12 } }>
						<RichTextInput name="description" label="Description" />
					</Grid>

					<Grid size={ { xs: 12 } }>
						<Stack direction="row" spacing={ 2 } justifyContent="end">
							<Link to={ `/admin/${id}/orgs` }><Button color="error">Cancel</Button></Link>
							<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Organization</SubmitButton>
						</Stack>
					</Grid>

				</Grid>
			</Form>
		</Container>
	)
}

export default OrganizationsEdit

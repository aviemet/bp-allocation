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
import { useFormContext } from "react-hook-form"
import { useOrgs } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"
import { OrganizationSchema } from "/imports/api/db"

import { Form, TextInput, RichTextInput, SubmitButton, STATUS, type Status } from "/imports/ui/components/Form"
import { Loading } from "/imports/ui/components"

const FormReset = () => {
	const { orgs, orgsLoading } = useOrgs()
	const { id, orgId } = useParams({ strict: false })
	const { reset } = useFormContext<{ theme: string, title: string, ask: number | string, description: string }>()

	const orgStore = orgs?.find(org => org._id === orgId)

	useEffect(() => {
		if(!orgsLoading && orgStore) {
			reset({
				theme: id,
				title: orgStore.title || "",
				ask: orgStore.ask || "",
				description: orgStore.description || "",
			})
		}
	}, [orgsLoading, orgStore, id, reset])

	return null
}

const FormContent = ({ formStatus, setFormStatus }: { formStatus: Status, setFormStatus: (status: Status) => void }) => {
	const { id, orgId } = useParams({ strict: false })

	return (
		<>
			<FormReset />
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
						slotProps={ {
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							},
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
		</>
	)
}

const OrganizationsEdit = () => {
	const { orgs, orgsLoading } = useOrgs()
	const { id, orgId } = useParams({ strict: false })
	const navigate = useNavigate()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)

	useEffect(() => {
		if(formStatus === STATUS.SUCCESS) {
			setTimeout(() => navigate({ to: `/admin/${id}/orgs` }), 1000)
		}
	}, [formStatus, navigate, id])

	if(orgsLoading) return <Loading />

	const orgStore = orgs?.find(org => org._id === orgId)
	const org = {
		theme: id,
		title: orgStore?.title || "",
		ask: orgStore?.ask || "",
		description: orgStore?.description || "",
	}

	const sanitizeData = (data: Record<string, unknown>) => {
		const sanitizedData = data
		if(typeof sanitizedData.ask === "string") {
			sanitizedData.ask = parseFloat(sanitizedData.ask.replace(/[^\d.]/g, ""))
		}
		return sanitizedData
	}

	const onSubmit = async (data: Record<string, unknown>) => {
		setFormStatus(STATUS.SUBMITTING)
		try {
			let response
			if(orgId) {
				response = await OrganizationMethods.update.callAsync({ id: orgId, data })
			} else {
				const createData = {
					theme: String(data.theme),
					title: String(data.title),
					ask: Number(data.ask),
					description: String(data.description || ""),
				}
				response = await OrganizationMethods.create.callAsync(createData)
			}

			if(response) {
				setFormStatus(STATUS.SUCCESS)
			} else {
				setFormStatus(STATUS.ERROR)
				console.error({ response })
			}
		} catch (error) {
			setFormStatus(STATUS.ERROR)
			console.error({ error })
		}
	}

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
				<FormContent formStatus={ formStatus } setFormStatus={ setFormStatus } />
			</Form>
		</Container>
	)
}

export default OrganizationsEdit

import {
	Button,
	Grid,
	InputAdornment,
	Stack,
	Typography,
} from "@mui/material"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { useMembers } from "/imports/api/hooks"
import { MemberMethods } from "/imports/api/methods"
import { MemberSchema, MemberThemeSchema } from "/imports/api/db"
import { roundFloat } from "/imports/lib/utils"
import { type MemberTheme } from "/imports/types/schema"

import { Form, TextInput, SubmitButton, STATUS, type Status } from "/imports/ui/components/Form"

import { Loading } from "/imports/ui/components"

const MembersEdit = () => {
	const { members, isLoading: membersLoading } = useMembers()

	const { id, memberId } = useParams({ strict: false })
	const navigate = useNavigate()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)

	const sanitizeData = (data: Record<string, unknown>) => {
		const sanitizedData = data
		if(sanitizedData.amount) sanitizedData.amount = roundFloat(String(sanitizedData.amount))
		if(sanitizedData.number) sanitizedData.number = parseInt(String(sanitizedData.number))
		if(sanitizedData.chits) sanitizedData.chits = parseInt(String(sanitizedData.chits))
		return sanitizedData
	}

	const onSubmit = (data: Record<string, unknown>) => {
		setFormStatus(STATUS.SUBMITTING)
		if(memberId) {
			editUser(data)
		} else {
			createUser(data)
		}

	}

	const createUser = async (data: Record<string, unknown>) => {
		try {
			const upsertData = {
				firstName: String(data.firstName || ""),
				lastName: String(data.lastName || ""),
				initials: String(data.initials || ""),
				number: Number(data.number || 0),
				phone: String(data.phone || ""),
				email: String(data.email || ""),
				amount: Number(data.amount || 0),
				chits: Number(data.chits || 0),
				theme: String(data.theme),
			}
			await MemberMethods.upsert.callAsync(upsertData)
			setFormStatus(STATUS.SUCCESS)
		} catch (err) {
			setFormStatus(STATUS.ERROR)
			console.error({ err })
		}
	}

	const editUser = async (data: Record<string, unknown>) => {
		const memberStore = members?.values.find(member => member._id === memberId)
		if(!memberStore) return

		const memberTheme = memberStore.theme as MemberTheme
		if(!memberTheme?._id) return

		try {
			await MemberMethods.update.callAsync({ id: memberStore._id, data: {
				firstName: String(data.firstName || ""),
				lastName: String(data.lastName || ""),
				initials: String(data.initials || ""),
				number: Number(data.number || 0),
				phone: String(data.phone || ""),
				email: String(data.email || ""),
			} })
			await MemberMethods.updateTheme.callAsync({ id: memberTheme._id, data: {
				amount: Number(data.amount || 0),
				chits: Number(data.chits || 0),
			} })
			setFormStatus(STATUS.SUCCESS)
		} catch (err) {
			setFormStatus(STATUS.ERROR)
			console.error({ err })
		}
	}

	useEffect(() => {
		if(formStatus === STATUS.SUCCESS) {
			setTimeout(() => navigate({ to: "/admin/$id/members", params: { id } }), 1000)
		}
	}, [formStatus, navigate, id])

	const onError = (errors: unknown, data: unknown) => {
		console.error({ errors, data })
	}

	const handleInitials = (value: unknown, name: string, form: { setValue: (field: string, val: string) => void }) => {
		if(!["firstName", "lastName"].includes(name)) return
		const values = value as Record<string, string>
		if(!values.firstName || !values.lastName) return

		form.setValue("initials", (values.firstName.charAt(0) + values.lastName.charAt(0)).toUpperCase())
	}

	const schema = MemberSchema.omit("fullName", "code")
		.extend(MemberThemeSchema.omit("member", "chitVotes", "allocations", "createdAt"))

	if(membersLoading) return <Loading />

	const memberStore = members?.values.find(member => member._id === memberId)
	const memberTheme = memberStore?.theme as MemberTheme | undefined
	const member = {
		theme: id,
		firstName: memberStore?.firstName || "",
		lastName: memberStore?.lastName || "",
		initials: memberStore?.initials || "",
		number: memberStore?.number || 0,
		amount: memberTheme?.amount || 0,
		phone: memberStore?.phone || "",
		email: memberStore?.email || "",
		chits: memberTheme?.chits || 0,
	}
	return (
		<>
			<Typography component="h1" variant="h3" sx={ { mb: 1 } }>
				{ memberId ? "Edit" : "New" } Member
			</Typography>

			<Form
				schema={ schema }
				defaultValues={ member }
				onValidSubmit={ onSubmit }
				onSanitize={ sanitizeData }
				onValidationError={ onError }
			>
				<Grid container spacing={ 2 }>
					<Grid size={ { xs: 12, md: 6 } }>
						<TextInput name="firstName" label="First Name" required onUpdate={ handleInitials } />
					</Grid>

					<Grid size={ { xs: 12, md: 6 } }>
						<TextInput name="lastName" label="Last Name" required onUpdate={ handleInitials } />
					</Grid>

					<Grid size={ { xs: 12, md: 2 } }>
						<TextInput name="number" label="Member Number" required />
					</Grid>

					<Grid size={ { xs: 12, md: 2 } }>
						<TextInput name="initials" label="Initials" />
					</Grid>

					<Grid size={ { xs: 12, md: 4 } }>
						<TextInput name="phone" label="Phone Number" />
					</Grid>

					<Grid size={ { xs: 12, md: 4 } }>
						<TextInput name="email" label="Email Address" />
					</Grid>

					<Grid size={ { xs: 12, md: 8 } }>
						<TextInput name="amount" label="Voting Funds" slotProps={ {
							input: {
								startAdornment: <InputAdornment position="start">$</InputAdornment>,
							},
						} } />
					</Grid>

					<Grid size={ { xs: 12, md: 4 } }>
						<TextInput name="chits" label="Chit Votes" />
					</Grid>

					<Grid size={ { xs: 12 } }>
						<Stack direction="row" spacing={ 2 } justifyContent="end">
							<Button color="error" onClick={ () => navigate({ to: "/admin/$id/members", params: { id } }) }>Cancel</Button>
							<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Member</SubmitButton>
						</Stack>
					</Grid>

				</Grid>
			</Form>
		</>
	)
}

export default MembersEdit

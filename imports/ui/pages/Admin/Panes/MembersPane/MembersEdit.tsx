import {
	Button,
	Grid,
	InputAdornment,
	Stack,
	Typography,
} from "@mui/material"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { useMembers } from "/imports/api/providers"
import { MemberMethods } from "/imports/api/methods"
import { MemberSchema, MemberThemeSchema } from "/imports/api/db"
import { roundFloat } from "/imports/lib/utils"

import { Form, TextInput, SubmitButton, STATUS } from "/imports/ui/components/Form"

import { Loading } from "/imports/ui/components"

const MembersEdit = () => {
	const { members, isLoading: membersLoading } = useMembers()

	const { id, memberId } = useParams({ strict: false })
	const navigate = useNavigate()

	const [formStatus, setFormStatus] = useState(STATUS.READY)

	const sanitizeData = data => {
		const sanitizedData = data
		if(sanitizedData.amount) sanitizedData.amount = roundFloat(sanitizedData.amount)
		if(sanitizedData.number) sanitizedData.number = parseInt(sanitizedData.number)
		if(sanitizedData.chits) sanitizedData.chits = parseInt(sanitizedData.chits)
		return sanitizedData
	}

	const onSubmit = data => {
		// console.log({ data })
		setFormStatus(STATUS.SUBMITTING)
		if(memberId) {
			editUser(data)
		} else {
			createUser(data)
		}

	}

	const createUser = async data => {
		try {
			await MemberMethods.upsert.callAsync(data)
			setFormStatus(STATUS.SUCCESS)
		} catch(err) {
			setFormStatus(STATUS.ERROR)
			console.error({ err })
		}
	}

	const editUser = async data => {
		const memberStore = members?.values.find(member => member._id === memberId)

		try {
			await MemberMethods.update.callAsync({ id: memberStore._id, data: {
				firstName: data.firstName || "",
				lastName: data.lastName || "",
				initials: data.initials || "",
				number: data.number || "",
				phone: data.phone || "",
				email: data.email || "",
			} })
			await MemberMethods.updateTheme.callAsync({ id: memberStore.theme._id, data: {
				amount: data.amount,
				chits: data.chits,
			} })
			setFormStatus(STATUS.SUCCESS)
		} catch(err) {
			setFormStatus(STATUS.ERROR)
			console.error({ err })
		}
	}

	useEffect(() => {
		if(formStatus === STATUS.SUCCESS) {
			setTimeout(() => navigate({ to: "/admin/$id/members", params: { id } }), 1000)
		}
	}, [formStatus, navigate, id])

	const onError = (errors, data) => {
		console.log({ errors, data })
	}

	const handleInitials = (value, name, setValue) => {
		if(!["firstName", "lastName"].includes(name) || !value.firstName || !value.lastName) return

		setValue("initials", (value.firstName.charAt(0) + value.lastName.charAt(0)).toUpperCase())
	}

	const schema = MemberSchema.omit("fullName", "code")
		.extend(MemberThemeSchema.omit("member", "chitVotes", "allocations", "createdAt"))

	if(membersLoading) return <Loading />

	const memberStore = members?.values.find(member => member._id === memberId)
	const member = {
		theme: id,
		firstName: memberStore?.firstName || "",
		lastName: memberStore?.lastName || "",
		initials: memberStore?.initials || "",
		number: memberStore?.number || "",
		amount: memberStore?.theme?.amount || "",
		phone: memberStore?.phone || "",
		email: memberStore?.email || "",
		chits: memberStore?.theme?.chits || "",
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
						<TextInput name="amount" label="Voting Funds" InputProps={ {
							startAdornment: <InputAdornment position="start">$</InputAdornment>,
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

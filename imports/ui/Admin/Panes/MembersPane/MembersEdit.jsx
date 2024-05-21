import React, { useState, useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useMembers } from '/imports/api/providers'
import { MemberMethods } from '/imports/api/methods'
import { MemberSchema, MemberThemeSchema } from '/imports/api/db/schema'
import { roundFloat } from '/imports/lib/utils'

import { Form, TextInput, SubmitButton, STATUS, } from '/imports/ui/Components/Form'

import {
	Button,
	Grid,
	InputAdornment,
	Stack,
	Typography,
} from '@mui/material'
import { Loading } from '/imports/ui/Components'

const MembersEdit = () => {
	const { members, isLoading: membersLoading } = useMembers()

	const { id, memberId } = useParams()
	const history = useHistory()

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

	const createUser = data => {
		MemberMethods.upsert.call(data, (err, res) => {
			if(err) {
				setFormStatus(STATUS.ERROR)
				console.error({ err })
			} else {
				setFormStatus(STATUS.SUCCESS)
			}
		})
	}

	const editUser = data => {
		const memberStore = members?.values.find(member => member._id === memberId)

		MemberMethods.update.call({ id: memberStore._id, data: {
			firstName: data.firstName || '',
			lastName: data.lastName || '',
			initials: data.initials || '',
			number: data.number || '',
			phone: data.phone || '',
			email: data.email || '',
		} }, (err, res) => {
			if(err) {
				setFormStatus(STATUS.ERROR)
				console.error({ err })
			} else {
				MemberMethods.updateTheme.call({ id: memberStore.theme._id, data: {
					amount: data.amount,
					chits: data.chits,
				} }, (err, res) => {
					if(err) {
						setFormStatus(STATUS.ERROR)
						console.error({ err })
					} else {
						setFormStatus(STATUS.SUCCESS)
					}
				})
			}
		})
	}

	useEffect(() => {
		if(formStatus === STATUS.SUCCESS) {
			setTimeout(() => history.push(`/admin/${id}/members`), 1000)
		}
	}, [formStatus])

	const onError = (errors, data) => {
		console.log({ errors, data })
	}

	const handleInitials = (value, name, setValue) => {
		if(!['firstName', 'lastName'].includes(name) || !value.firstName || !value.lastName) return

		setValue('initials', (value.firstName.charAt(0) + value.lastName.charAt(0)).toUpperCase())
	}

	const schema = MemberSchema.omit('fullName', 'code')
		.extend(MemberThemeSchema.omit('member', 'chitVotes', 'allocations', 'createdAt'))

	if(membersLoading) return <Loading />

	const memberStore = members?.values.find(member => member._id === memberId)
	const member = {
		theme: id,
		firstName: memberStore?.firstName || '',
		lastName: memberStore?.lastName || '',
		initials: memberStore?.initials || '',
		number: memberStore?.number || '',
		amount: memberStore?.theme?.amount || '',
		phone: memberStore?.phone || '',
		email: memberStore?.email || '',
		chits: memberStore?.theme?.chits || '',
	}
	return (
		<>
			<Typography component="h1" variant="h3" sx={ { mb: 1 } }>
				{ memberId ? 'Edit' : 'New' } Member
			</Typography>

			<Form
				schema={ schema }
				defaultValues={ member }
				onValidSubmit={ onSubmit }
				onSanitize={ sanitizeData }
				onValidationError={ onError }
			>
				<Grid container spacing={ 2 }>
					<Grid item xs={ 12 } md={ 6 }>
						<TextInput name="firstName" label="First Name" required onUpdate={ handleInitials } />
					</Grid>

					<Grid item xs={ 12 } md={ 6 }>
						<TextInput name="lastName" label="Last Name" required onUpdate={ handleInitials } />
					</Grid>

					<Grid item xs={ 12 } md={ 2 }>
						<TextInput name="number" label="Member Number" required />
					</Grid>

					<Grid item xs={ 12 } md={ 2 }>
						<TextInput name="initials" label="Initials" />
					</Grid>

					<Grid item xs={ 12 } md={ 4 }>
						<TextInput name="phone" label="Phone Number" />
					</Grid>

					<Grid item xs={ 12 } md={ 4 }>
						<TextInput name="email" label="Email Address" />
					</Grid>

					<Grid item xs={ 12 } md={ 8 }>
						<TextInput name="amount" label="Voting Funds" InputProps={ {
							startAdornment: <InputAdornment position="start">$</InputAdornment>,
						} } />
					</Grid>

					<Grid item xs={ 12 } md={ 4 }>
						<TextInput name="chits" label="Chit Votes" />
					</Grid>

					<Grid item xs={ 12 }>
						<Stack direction="row" spacing={ 2 } justifyContent="end">
							<Button color="error" onClick={ () => history.push(`/admin/${id}/members`) }>Cancel</Button>
							<SubmitButton  type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Member</SubmitButton>
						</Stack>
					</Grid>

				</Grid>
			</Form>
		</>
	)
}

export default MembersEdit
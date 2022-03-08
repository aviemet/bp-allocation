import React, { useState } from 'react'
import { Link,useParams, useHistory } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useMessage } from '/imports/api/providers'
import { MessageMethods } from '/imports/api/methods'
import { MessageSchema } from '/imports/api/db/schema'

import { Form, TextInput, Switch, SubmitButton, STATUS, RichTextInput } from '/imports/ui/Components/Form'
import styled from '@emotion/styled'
import {
	Button,
	CircularProgress,
	Grid,
	Paper,
	Stack,
	Typography,
} from '@mui/material'

const MessageEdit = observer(() => {
	const { id: themeId, messageId, type } = useParams()

	let message
	let messageLoading = false
	if(messageId) {
		const { message: loadedMessage, isLoading } = useMessage(messageId)
		message = loadedMessage
		messageLoading = isLoading
	} else {
		message = {}
	}

	const history = useHistory()

	const [formStatus, setFormStatus] = useState(STATUS.READY)
	const [preview, setPreview] = useState(message?.body || '')

	const messageData = {
		title: message?.title || '',
		subject: message?.subject || '',
		body: message?.body || '',
		type: message?.type || type || '',
		active: message?.active || true,
		includeLink: message?.includeLink || false,
	}

	const sanitizeData = data => {
		console.log({ data })
		return data
	}

	console.log({ message })

	const onSubmit = data => {
		console.log({ data })
		setFormStatus(STATUS.SUBMITTING)
		if(message._id) {
			console.log('updating')
			MessageMethods.update.call({ id: message._id, data }, (err, res) => {
				if(err) {
					setFormStatus(STATUS.ERROR)
					console.error(err)
				} else {
					setFormStatus(STATUS.SUCCESS)
					history.push(`/admin/${themeId}/settings/messages`)
				}
			})
		} else {
			MessageMethods.create.call(data, (err, res) => {
				if(err) {
					setFormStatus(STATUS.ERROR)
					console.error(err)
				} else {
					setFormStatus(STATUS.SUCCESS)
					history.push(`/admin/${themeId}/settings/messages`)
				}
			})
		}
	}

	const onError = (error, data) => {
		console.error(error, data)
	}

	const handlePreview = data => {
		setPreview(data.body)
	}

	if(messageLoading) return <CircularProgress />
	return (
		<>
			<Typography component="h1" variant="h3" sx={ { mb: 1 } }>
				{ message?._id ? 'Edit' : 'New' } { messageData?.type[0].toUpperCase() + messageData?.type.substring(1) } Message
			</Typography>

			<Form
				schema={ MessageSchema }
				defaultValues={ messageData }
				onValidSubmit={ onSubmit }
				onSanitize={ sanitizeData }
				onValidationError={ onError }
				onUpdate={ handlePreview }
			>
				<Grid container spacing={ 2 }>
					<Grid item xs={ 12 }>
						<TextInput name="title" label="Title" />
					</Grid>

					{ messageData?.type === 'email' && (
						<Grid item xs={ 12 }>
							<TextInput name="subject" label="Subject" required />
						</Grid>
					) }

					<Grid item xs={ 12 }>
						{ messageData?.type === 'email' ?
							<RichTextInput name="body" label="Body" />
							:
							<TextInput name="body" label="Body" />
						}
					</Grid>

					<Grid item xs={ 12 }>
						<Switch name="active" label="Active" />
					</Grid>

					<Grid item xs={ 12 }>
						<Switch name="includeLink" label="Include Voting Link" />
					</Grid>

					<Grid item xs={ 12 } >
						<Stack direction="row" spacing={ 2 } justifyContent="end">
							<Button
								component={ Link }
								color="error"
								to={ `/admin/${themeId}/settings/messages` }
							>Cancel</Button>
							<SubmitButton type="submt" status={ formStatus } setStatus={ setFormStatus }>Save Message</SubmitButton>
						</Stack>
					</Grid>
				</Grid>
			</Form>

			{ messageData?.type === 'email' && (
				<>
					<Typography component="h2" variant="h5">Preview</Typography>
					<Paper sx={ { p: 3 } }>
						<Preview><div dangerouslySetInnerHTML={ { __html: preview } } /></Preview>
					</Paper>
				</>
			) }
		</>
	)
})

const Preview = styled.div`
	& > div {
		max-width: 600px;
		margin: 0 auto;
	}

	img {
		max-width: 100% !important;
		margin: 4px;
		padding: 4px;
		background-color: #FFF;
		border: solid 1px #CCC;
		border-radius: 2px;
	}
`

export default MessageEdit

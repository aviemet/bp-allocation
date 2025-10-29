import styled from "@emotion/styled"
import {
	Box,
	Button,
	FormGroup,
	FormControl,
	FormLabel,
	Grid,
	Paper,
	Stack,
	Typography,
} from "@mui/material"
import { Link, useParams, useNavigate } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import { useMessage } from "/imports/api/providers"
import { MessageMethods } from "/imports/api/methods"
import { MessageSchema } from "/imports/api/db"
import {
	Form,
	TextInput,
	Switch,
	SubmitButton,
	STATUS,
	RichTextInput,
	CheckboxInput,
} from "/imports/ui/Components/Form"
import React, { useState } from "react"
import { Loading } from "/imports/ui/Components"

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
	const [preview, setPreview] = useState(message?.body || "")

	const messageData = {
		title: message?.title || "",
		subject: message?.subject || "",
		body: message?.body || "",
		type: message?.type || type || "",
		active: message?.active || true,
		includeLink: message?.includeLink || false,
		optOutRounds: {
			one: !!message?.optOutRounds?.one,
			two: !!message?.optOutRounds?.two,
		},
	}

	const onSubmit = data => {
		setFormStatus(STATUS.SUBMITTING)
		if(message._id) {
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

	if(messageLoading) return <Loading />
	return (
		<>
			<Typography component="h1" variant="h3" sx={ { mb: 1 } }>
				{ message?._id ? "Edit" : "New" } { messageData?.type[0].toUpperCase() + messageData?.type.substring(1) } Message
			</Typography>

			<Form
				schema={ MessageSchema }
				defaultValues={ messageData }
				onValidSubmit={ onSubmit }
				onValidationError={ onError }
				onUpdate={ handlePreview }
			>
				<Grid container spacing={ 2 }>
					<Grid item xs={ 12 }>
						<TextInput name="title" label="Title" />
					</Grid>

					{ messageData?.type === "email" && (
						<Grid item xs={ 12 }>
							<TextInput name="subject" label="Subject" required />
						</Grid>
					) }

					<Grid item xs={ 12 }>
						{ messageData?.type === "email" ?
							<RichTextInput name="body" label="Body" />
							:
							<TextInput name="body" label="Body" />
						}
					</Grid>

					<Grid item xs={ 12 } sm={ 6 }>
						<Paper sx={ { p: 2 } }>
							<Box>
								<Switch name="active" label="Active" />
							</Box>
							<Box>
								<Switch name="includeLink" label="Include Voting Link" />
							</Box>
						</Paper>
					</Grid>

					<Grid item xs={ 12 } sm={ 6 }>
						<Paper sx={ { p: 2 } }>
							<FormControl component="fieldset" variant="standard">
								<FormLabel component="legend">Skip If Member Has Voted In:</FormLabel>
								<FormGroup>
									<CheckboxInput name="optOutRounds.one" label="Round One" onUpdate={ (value, name, setValue) => {
										// console.log({ value, name })
									} } />
									<CheckboxInput name="optOutRounds.two" label="Round Two" />
								</FormGroup>
							</FormControl>
						</Paper>
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

			{ messageData?.type === "email" && (
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

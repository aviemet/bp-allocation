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
import { useMessage } from "/imports/api/hooks"
import { MessageMethods } from "/imports/api/methods"
import { MessageSchema } from "/imports/api/db"
import { type Message } from "/imports/types/schema"
import {
	Form,
	TextInput,
	Switch,
	SubmitButton,
	RichTextInput,
	CheckboxInput,
	STATUS,
	type Status,
} from "/imports/ui/components/Form"
import { useState } from "react"
import { Loading } from "/imports/ui/components"

type MessageFormData = Omit<Message, "_id" | "createdAt" | "updatedAt">

const MessageEdit = () => {
	const { id: themeId, messageId, type } = useParams({ strict: false })
	const { message: loadedMessage, messageLoading } = useMessage(messageId || "")

	const navigate = useNavigate()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)

	const message = messageId ? loadedMessage : undefined
	const [preview, setPreview] = useState(message?.body || "")

	const messageData: MessageFormData = {
		title: message?.title || "",
		subject: message?.subject || "",
		body: message?.body || "",
		type: (message?.type || type || "text"),
		active: message?.active || true,
		includeLink: message?.includeLink || false,
		optOutRounds: {
			one: !!message?.optOutRounds?.one,
			two: !!message?.optOutRounds?.two,
		},
	}

	const onSubmit = async (data: MessageFormData) => {
		setFormStatus(STATUS.SUBMITTING)
		try {
			if(message?._id) {
				await MessageMethods.update.callAsync({ id: message._id, data })
			} else {
				await MessageMethods.create.callAsync(data)
			}
			setFormStatus(STATUS.SUCCESS)
			navigate({ to: `/admin/${themeId}/settings/messages` })
		} catch (err) {
			setFormStatus(STATUS.ERROR)
			console.error(err)
		}
	}

	const onError = (error: unknown, data: unknown) => {
		console.error(error, data)
	}

	const handlePreview = (data: Partial<MessageFormData>) => {
		setPreview(data.body || "")
	}

	if(messageId && (messageLoading || !message)) return <Loading />
	return (
		<>
			<Typography component="h1" variant="h3" sx={ { mb: 1 } }>
				{ message?._id ? "Edit" : "New" } { messageData?.type[0].toUpperCase() + messageData?.type.substring(1) } Message
			</Typography>

			<Form<MessageFormData>
				schema={ MessageSchema }
				defaultValues={ messageData }
				onValidSubmit={ onSubmit }
				onValidationError={ onError }
				onUpdate={ handlePreview }
			>
				<Grid container spacing={ 2 }>
					<Grid size={ { xs: 12 } }>
						<TextInput name="title" label="Title" />
					</Grid>

					{ messageData?.type === "email" && (
						<Grid size={ { xs: 12 } }>
							<TextInput name="subject" label="Subject" required />
						</Grid>
					) }

					<Grid size={ { xs: 12 } }>
						{ messageData?.type === "email" ?
							<RichTextInput name="body" label="Body" />
							:
							<TextInput name="body" label="Body" />
						}
					</Grid>

					<Grid size={ { xs: 12, sm: 6 } }>
						<Paper sx={ { p: 2 } }>
							<Box>
								<Switch name="active" label="Active" />
							</Box>
							<Box>
								<Switch name="includeLink" label="Include Voting Link" />
							</Box>
						</Paper>
					</Grid>

					<Grid size={ { xs: 12, sm: 6 } }>
						<Paper sx={ { p: 2 } }>
							<FormControl component="fieldset" variant="standard">
								<FormLabel component="legend">Skip If Member Has Voted In:</FormLabel>
								<FormGroup>
									<CheckboxInput name="optOutRounds.one" label="Round One" />
									<CheckboxInput name="optOutRounds.two" label="Round Two" />
								</FormGroup>
							</FormControl>
						</Paper>
					</Grid>

					<Grid size={ { xs: 12 } } >
						<Stack direction="row" spacing={ 2 } justifyContent="end">
							<Button
								component={ Link }
								color="error"
								to={ `/admin/${themeId}/settings/messages` }
							>Cancel</Button>
							<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>Save Message</SubmitButton>
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
}

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

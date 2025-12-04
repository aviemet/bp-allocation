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
import { Link } from "@tanstack/react-router"
import { type Message } from "/imports/types/schema"
import {
	TextInput,
	Switch,
	SubmitButton,
	RichTextInput,
	CheckboxInput,
	type Status,
} from "/imports/ui/components/Form"
import { useWatch, useFormContext } from "react-hook-form"

type MessageFormData = Omit<Message, "_id" | "createdAt" | "updatedAt">

interface EditMessageFormProps {
	messageData: MessageFormData
	formStatus: Status
	setFormStatus: (status: Status) => void
	themeId: string
}

const EditMessageForm = ({ messageData, formStatus, setFormStatus, themeId }: EditMessageFormProps) => {
	const { control } = useFormContext<MessageFormData>()
	const bodyValue = useWatch({ control, name: "body" })
	const preview = bodyValue || ""

	return (
		<>
			<Grid container spacing={ 2 }>
				<Grid size={ { xs: 12 } }>
					<TextInput name="title" label="Title" />
				</Grid>

				{ messageData?.type === "email" && (
					<Grid size={ { xs: 12 } }>
						<TextInput name="subject" label="Subject" required />
					</Grid>
				) }

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

				<Grid size={ { xs: 12 } }>
					{ messageData?.type === "email" ?
						<RichTextInput name="body" label="Body" />
						:
						<TextInput name="body" label="Body" />
					}
				</Grid>

				{ messageData?.type === "email" && (
					<Grid size={ { xs: 12 } }>
						<Typography component="h2" variant="h5">Preview</Typography>
						<Paper sx={ { p: 3 } }>
							<Preview><div dangerouslySetInnerHTML={ { __html: preview } } /></Preview>
						</Paper>
					</Grid>
				) }

				<Grid size={ { xs: 12 } } >
					<Stack direction="row" spacing={ 2 } justifyContent="end">
						<Button
							component={ Link }
							color="error"
							to={ `/admin/${themeId}/settings/messages` }
						>
							Cancel
						</Button>

						<SubmitButton type="submit" status={ formStatus } setStatus={ setFormStatus }>
							Save Message
						</SubmitButton>
					</Stack>
				</Grid>
			</Grid>

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

export default EditMessageForm

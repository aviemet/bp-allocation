import { Typography } from "@mui/material"
import { useParams, useNavigate } from "@tanstack/react-router"
import { useMessage } from "/imports/api/hooks"
import { MessageMethods } from "/imports/api/methods"
import { MessageSchema } from "/imports/api/db"
import { type Message } from "/imports/types/schema"
import { Form, STATUS, type Status } from "/imports/ui/components/Form"
import { useState } from "react"

import { Loading } from "/imports/ui/components"
import EditMessageForm from "./EditMessageForm"

type MessageFormData = Omit<Message, "_id" | "createdAt" | "updatedAt">

const MessageEdit = () => {
	const { id: themeId, messageId, type } = useParams({ strict: false })
	const { message: loadedMessage, messageLoading } = useMessage(messageId || "")

	const navigate = useNavigate()

	const [formStatus, setFormStatus] = useState<Status>(STATUS.READY)

	const message = messageId ? loadedMessage : undefined

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
			>
				<EditMessageForm
					messageData={ messageData }
					formStatus={ formStatus }
					setFormStatus={ setFormStatus }
					themeId={ themeId }
				/>
			</Form>
		</>
	)
}

export default MessageEdit

import styled from "@emotion/styled"
import EmailIcon from "@mui/icons-material/Email"
import SmsIcon from "@mui/icons-material/Sms"
import { Paper, ButtonProps } from "@mui/material"
import { Meteor } from "meteor/meteor"
import { useState, useMemo } from "react"

import { useTheme } from "/imports/api/hooks"
import { type MessageData } from "/imports/api/db"

import CustomConfirm from "/imports/ui/components/Dialogs/CustomConfirm"
import { emailVotingLink, textVotingLink } from "/imports/lib/utils"
import { type Status, STATUS, SubmitButton } from "/imports/ui/components/Form"

interface ButtonValue {
	method: string
	icon: typeof EmailIcon
}

const buttonValues: Record<"email" | "text", ButtonValue> = {
	email: {
		method: "emailVotingLinkToMembers",
		icon: EmailIcon,
	},
	text: {
		method: "textVotingLinkToMembers",
		icon: SmsIcon,
	},
}

interface SendWithFeedbackButtonProps extends Omit<ButtonProps, "onClick"> {
	message: MessageData
	members?: string[] | "all"
}

const SendWithFeedbackButton = ({ message, members, ...rest }: SendWithFeedbackButtonProps) => {
	const { theme } = useTheme()

	const [localButtonStatus, setLocalButtonStatus] = useState<Status | null>(null)
	const [modalOpen, setModalOpen] = useState(false)

	const messageStatus = theme?.messagesStatus?.find(status => status.messageId === message._id)

	const buttonStatus = useMemo(() => {
		if(messageStatus?.error) return STATUS.ERROR
		if(localButtonStatus !== null) return localButtonStatus
		return STATUS.READY
	}, [localButtonStatus, messageStatus?.error])

	const buttonContent = useMemo(() => {
		if(messageStatus?.error) return "Error Sending Messages"
		if(!messageStatus?.sending && messageStatus?.sent) return "Send Again"
		return "Send"
	}, [messageStatus?.error, messageStatus?.sending, messageStatus?.sent])

	const handleSetButtonStatus = (status: Status) => {
		setLocalButtonStatus(status)
	}

	let previewMessage = message.body
	if(message.includeLink && theme?.slug) {
		if(message.type === "email") {
			previewMessage += emailVotingLink(theme.slug, "TEST")
		} else if(message.type === "text") {
			previewMessage += textVotingLink(theme.slug, "TEST")
		}
	}

	const handleSendMessage = () => {
		if(!theme) return
		setModalOpen(false)
		setLocalButtonStatus(null)
		Meteor.call(buttonValues[message.type].method, { themeId: theme._id, message, members })
	}

	let memberCountMessage = "every member"
	if(Array.isArray(members)) {
		memberCountMessage = `${members.length} member${members.length !== 1 ? "s" : ""}`
	}

	return (
		<>
			<SubmitButton
				onClick={ () => setModalOpen(true) }
				status={ buttonStatus }
				setStatus={ handleSetButtonStatus }
				icon={ buttonValues[message.type].icon }
				{ ...rest }
			>
				{ buttonContent }
			</SubmitButton>

			<CustomConfirm
				header={ `Confirm sending ${message.type}` }
				content={
					<>
						<div>{ `Do you want to send the ${message.type}, "${message.title}" to ${memberCountMessage}?` }</div>
						<div>Preview:</div>
						<Paper elevation={ 1 } sx={ { p: 2 } }>
							<FormattedMessageBody dangerouslySetInnerHTML={ { __html: previewMessage || "" } } />
						</Paper>
					</>
				}
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				confirmAction={ handleSendMessage }
				cancelAction={ () => {} }
				okText="Send The Message"
				cancelText="Cancel"
				width="md"
			/>
		</>
	)
}

const FormattedMessageBody = styled.div`
	white-space: 'pre-wrap';
	
	img { 
		max-width: 100% !important;
		margin: 4px;
		padding: 4px;
		background-color: #FFF;
		border: solid 1px #CCC;
		border-radius: 2px;
	} 
`

export default SendWithFeedbackButton

import {
	Box,
	Paper,
	Stack,
	Table,
	TableHead,
	TableBody,
	TableRow,
	TableCell,
	Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { Link } from "@tanstack/react-router"
import React from "react"
import { useTheme, useMessages } from "/imports/api/providers"
import SendWithFeedbackButton from "/imports/ui/Components/Buttons/SendWithFeedbackButton"
import { Loading } from "/imports/ui/Components"

const Messages = () => {
	const { theme } = useTheme()
	const { messages, isLoading: messagesLoading } = useMessages()

	if(messagesLoading) return <Loading />

	return (
		<>
			<Box sx={ { mb: 2 } }>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Typography component="h1" variant="h4">Messages</Typography>
					<div style={ { textAlign: "right" } }><Link to={ `/admin/${theme._id}/settings/messages` }>Message Settings</Link></div>
				</Stack>
			</Box>

			<MessageTypeCard>
				<Typography component="h2" variant="h5">Texts</Typography>
				<Table variant="striped">
					<TableHead>
						<TableRow>
							<TableCell>Title</TableCell>
							<TableCell>Body</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{ messages.values.map(message => {
							if(message.active && message.type === "text") return (
								<TableRow key={ message._id }>
									<TableCell>
										{ message.title }
									</TableCell>
									<TableCell>
										{ message.body }
									</TableCell>
									<TableCell>
										<SendWithFeedbackButton message={ message } />
									</TableCell>
								</TableRow>
							)
						}) }
					</TableBody>
				</Table>
			</MessageTypeCard>

			<MessageTypeCard>
				<Typography component="h2" variant="h5">Emails</Typography>
				<Table variant="striped">
					<TableHead>
						<TableRow>
							<TableCell>Title</TableCell>
							<TableCell>Subject</TableCell>
							<TableCell>Actions</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{ messages.values.map(message => {
							if(message.active && message.type === "email") return (
								<TableRow key={ message._id }>
									<TableCell>
										{ message.title }
									</TableCell>
									<TableCell>
										{ message.subject }
									</TableCell>
									<TableCell>
										<SendWithFeedbackButton message={ message } />
									</TableCell>
								</TableRow>
							)
						}) }
					</TableBody>
				</Table>

			</MessageTypeCard>
		</>
	)
}

const MessageTypeCard = styled(Paper)(({ theme }) => ({
	padding: 16,
	marginBottom: 16,
}))

export default Messages

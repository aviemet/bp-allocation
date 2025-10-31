import {
	Button,
	Stack,
	TableCell,
} from "@mui/material"
import { Link, useLocation } from "@tanstack/react-router"
import { useState } from "react"
import { useData, useMessages } from "/imports/api/providers"
import { MessageMethods } from "/imports/api/methods"
import type MessageStore from "/imports/api/stores/MessageStore"
import { type Message } from "/imports/types/schema"

import SortableTable from "/imports/ui/components/SortableTable"
import SendWithFeedbackButton from "/imports/ui/components/Buttons/SendWithFeedbackButton"

import ActiveToggle from "./ActiveToggle"
import IncludeVotingLinkToggle from "./IncludevotingLinkToggle"
import ConfirmationModal from "/imports/ui/components/Dialogs/ConfirmDelete"
import { Loading } from "/imports/ui/components"

const textHeaderCells = [
	{
		id: "active",
		label: "Active",
		width: 80,
	},
	{
		id: "title",
		label: "Title",
		width: "30%",
	},
	{
		id: "body",
		label: "Message",
		width: "30%",
	},
	{
		id: "votingLink",
		label: "Link",
		sort: false,
		disablePadding: true,
		width: "70px",
	},
	{
		id: "actions",
		label: "",
		sort: false,
		disablePadding: true,
	},
]

const emailHeaderCells = [
	{
		id: "active",
		label: "Active",
		width: 80,
	},
	{
		id: "title",
		label: "Title",
		width: "30%",
	},
	{
		id: "subject",
		label: "Subject",
		width: "30%",
	},
	{
		id: "votingLink",
		label: "Link",
		sort: false,
		disablePadding: true,
		width: "70px",
	},
	{
		id: "actions",
		label: "",
		sort: false,
		disablePadding: true,
	},
]

const Messages = () => {
	const { themeId } = useData()
	const { messages, isLoading: messagesLoading } = useMessages()

	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState("")
	const [ modalContent, setModalContent ] = useState("")
	const [ modalAction, setModalAction ] = useState<(() => void) | undefined>(undefined)

	const { pathname } = useLocation()

	const handleBulkDelete = (selected: string[], onSuccess: () => void) => {
		console.log({ selected })
		const plural = selected.length > 1

		setModalHeader(`Permanently delete message${plural ? "s" : ""}?`)
		setModalContent(`This will permanently remove the message${plural ? "s" : ""}. This action is not reversable.`)
		setModalAction(() => () => {
			selected.forEach(id => {
				MessageMethods.remove.call(id)
			})
			onSuccess()
		})
		setModalOpen(true)
	}

	const handleTextEdits = (id: string, data: Partial<Omit<Message, "_id" | "createdAt" | "updatedAt">>) => {
		MessageMethods.update.call({ id, data }, (err: Error | null) => {
			if(err) {
				console.error(err)
			}
		})
	}

	if(messagesLoading || !messages) return <Loading />

	return (
		<>
			<SortableTable
				title={ <Stack direction="row" alignItems="center" justifyContent="space-between">
					<div>Text Messages</div>
					<Button component={ Link } to={ `/admin/${themeId}/settings/messages/new/text` }>+ New Text Message</Button>
				</Stack> }
				headCells={ textHeaderCells }
				rows={ messages?.values.filter((message: MessageStore) => message.type === "text") || [] }
				defaultOrderBy="createdAt"
				paginate={ false }
				onBulkDelete={ handleBulkDelete }
				fixed={ true }
				tableHeadTopRow={ undefined }
				collapse={ undefined }
				filterParams={ undefined }
				onFilterParamsChange={ undefined }
				render={ (message: MessageStore) => (
					<>
						<TableCell>
							<ActiveToggle message={ message } />
						</TableCell>
						<TableCell>
							<Link to={ `${pathname}/${message._id}` }>{ message.title }</Link>
						</TableCell>
						<TableCell>{ message.body }</TableCell>
						<TableCell>
							<IncludeVotingLinkToggle message={ message } />
						</TableCell>
						<TableCell>
							<SendWithFeedbackButton message={ message } />
						</TableCell>
					</>
				) }
			/>

			<SortableTable
				title={ <Stack direction="row" alignItems="center" justifyContent="space-between">
					<div>Email Messages</div>
					<Button component={ Link } to={ `/admin/${themeId}/settings/messages/new/email` }>+ New Email Message</Button>
				</Stack> }
				headCells={ emailHeaderCells }
				rows={ messages?.values.filter((message: MessageStore) => message.type === "email") || [] }
				defaultOrderBy="createdAt"
				paginate={ false }
				onBulkDelete={ handleBulkDelete }
				fixed={ true }
				tableHeadTopRow={ undefined }
				collapse={ undefined }
				filterParams={ undefined }
				onFilterParamsChange={ undefined }
				render={ (message: MessageStore) => (
					<>
						<TableCell>
							<ActiveToggle message={ message } />
						</TableCell>
						<TableCell><Link to={ `${pathname}/${message._id}` }>{ message.title }</Link></TableCell>
						<TableCell>{ message.subject }</TableCell>
						<TableCell>
							<IncludeVotingLinkToggle message={ message } />
						</TableCell>
						<TableCell>
							<SendWithFeedbackButton message={ message } />
						</TableCell>
					</>
				) }
			/>

			<ConfirmationModal
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				header={ modalHeader }
				content={ modalContent }
				confirmAction={ modalAction }
			/>
		</>
	)
}

export default Messages

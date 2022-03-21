import React, { useState } from 'react'
import { useData, useMessages, useMembers } from '/imports/api/providers'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { MessageMethods } from '/imports/api/methods'

import SortableTable from '/imports/ui/Components/SortableTable'
import SendWithFeedbackButton from '/imports/ui/Components/Buttons/SendWithFeedbackButton'
import {
	Button,
	Stack,
	TableCell,
} from '@mui/material'
import IncludeVotingLinkToggle from './IncludevotingLinkToggle'
import ActiveToggle from './ActiveToggle'
import ConfirmationModal from '/imports/ui/Components/Dialogs/ConfirmDelete'
import { Loading } from '/imports/ui/Components'

const textHeaderCells = [
	{
		id: 'active',
		label: 'Active',
		width: 80,
	},
	{
		id: 'title',
		label: 'Title',
		width: '30%',
	},
	{
		id: 'body',
		label: 'Message',
		width: '30%',
	},
	{
		id: 'votingLink',
		label: 'Link',
		sort: false,
		disablePadding: true,
	},
	{
		id: 'actions',
		label: '',
		sort: false,
		disablePadding: true,
	}
]

const emailHeaderCells = [
	{
		id: 'active',
		label: 'Active',
		width: 80,
	},
	{
		id: 'title',
		label: 'Title',
		width: '30%',
	},
	{
		id: 'subject',
		label: 'Subject',
		width: '30%',
	},
	{
		id: 'votingLink',
		label: 'Link',
		sort: false,
		disablePadding: true,
	},
	{
		id: 'actions',
		label: '',
		sort: false,
		disablePadding: true,
	}
]

const Messages = () => {
	const { themeId } = useData()
	const { messages, isLoading: messagesLoading } = useMessages()
	const { members } = useMembers()

	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState('')
	const [ modalContent, setModalContent ] = useState('')
	const [ modalAction, setModalAction ] = useState()

	const { pathname } = useLocation()
	const history = useHistory()

	const handleBulkDelete = (selected, onSuccess) => {
		console.log({ selected })
		const plural = selected.size > 1

		setModalHeader(`Permanently delete message${plural ? 's' : ''}?`)
		setModalContent(`This will permanently remove the message${plural ? 's' : ''}. This action is not reversable.`)
		// Need to curry the function since useState calls passed functions
		setModalAction( () => () => {
			selected.forEach(id => {
				MessageMethods.remove.call(id)
			})
			onSuccess()
		})
		setModalOpen(true)
	}

	const handleTextEdits = (id, data) => {
		MessageMethods.update.call({ id, data }, err => {
			if(err) {
				console.error(err)
			}
		})
	}

	if(messagesLoading) return <Loading />

	return (
		<>
			<SortableTable
				title={ <Stack direction="row" alignItems="center" justifyContent="space-between">
					<div>Text Messages</div>
					<Button component={ Link } to={ `/admin/${themeId}/settings/messages/new/text` }>+ New Text Message</Button>
				</Stack> }
				headCells={ textHeaderCells }
				rows={ messages.values.filter(message => message.type === 'text') }
				defaultOrderBy='craetedAt'
				paginate={ false }
				onBulkDelete={ handleBulkDelete }
				fixed={ true }
				render={ message =>  (
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
				) }  />

			<SortableTable
				title={ <Stack direction="row" alignItems="center" justifyContent="space-between">
					<div>Email Messages</div>
					<Button component={ Link } to={ `/admin/${themeId}/settings/messages/new/email` }>+ New Email Message</Button>
				</Stack> }
				headCells={ emailHeaderCells }
				rows={ messages.values.filter(message => message.type === 'email') }
				defaultOrderBy='craetedAt'
				paginate={ false }
				onBulkDelete={ handleBulkDelete }
				render={ message => (
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
				) } />

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
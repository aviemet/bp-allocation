import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMembers, useSettings } from '/imports/api/providers'
import { formatters } from '/imports/lib/utils'
import { observer } from 'mobx-react-lite'
// import { toJS } from 'mobx'
import { isEmpty } from 'lodash'

import { MemberMethods } from '/imports/api/methods'

import SortableTable from '/imports/ui/Components/SortableTable'
import {
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
}  from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

// import ActionMenu from '/imports/ui/Components/Menus/ActionMenu'
import ContextMenu from './ContextMenu'
import ConfirmationModal from '/imports/ui/Components/Dialogs/ConfirmDelete'

// Saving for later
// const topHeadCells = [
// 	{
// 		label: '',
// 		span: 2,
// 	},
// 	{
// 		label: 'Funds',
// 		span: 2,
// 	},
// 	{
// 		label: 'Chits',
// 		span: 2,
// 	},
// 	{
// 		label: '',
// 		span: 1,
// 	}
// ]

const headCells = [
	{
		id: 'fullName',
		label: 'Member Name',
	},
	{
		id: 'theme.amount',
		label: 'Funds',
	},
	{
		id: 'theme.chits',
		label: 'Chits',
	},
	{
		id: 'actions',
		label: '',
		sort: false,
		disablePadding: true,
	},
]

// TODO: Also, the sorting and icon indicators for voting status
// TODO: Would be cool to get the filter icon to allow filtring by keyword
//       So, choosing 'not voted' would filter out all those who have voted
const MembersTable = observer(() => {
	const { members, loading: membersLoading } = useMembers()
	const { settings } = useSettings()

	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState('')
	const [ modalContent, setModalContent ] = useState('')
	const [ modalAction, setModalAction ] = useState()

	const { id: themeId } = useParams()

	// TODO: See about batching deletes
	const bulkDelete = (selected, onSuccess) => {
		const plural = selected.length > 1

		setModalHeader(`Permanently unlink member${plural ? 's' : ''} from this theme?`)
		setModalContent(`This will permanently remove the member${plural ? 's' : ''} from this theme. It will not delete the Member record${plural ? 's' : ''}.`)
		// Need to curry the function since useState calls passed functions
		setModalAction( () => () => {
			selected.forEach(id => {
				MemberMethods.removeMemberFromTheme.call({ memberId: id, themeId })
			})
			onSuccess()
		})
		setModalOpen(true)
	}

	const handleSearch = value => {
		members.searchFilter = value
	}

	// TODO: Get an x button to clear search filter values
	const clearSearch = () => {
		members.searchFilter = null
	}

	if(membersLoading || isEmpty(members)) {
		return (
			<>
				<Skeleton height={ 100 } />
				<Skeleton variant="text" height={ 100 } />
				<Skeleton variant="text" height={ 100 } />
			</>
		)
	}

	// TODO: Why isn't striping working now?
	return (
		<>
			<SortableTable
				onBulkDelete={ bulkDelete }
				headCells={ headCells }
				rows={ members.filteredMembers }
				defaultOrderBy='createdAt'
				paginationCounts={ [10,25,50] }
				filterParams={ members.searchFilter }
				onFilterParamsChange={ handleSearch }
				striped={ true }
				render={ member => {
					const votedTotal = member.theme.allocations.reduce((sum, allocation) => { return sum + allocation.amount }, 0)
					const votedChits = member.theme.chitVotes.length > 0
					const fullName = member.fullName ? member.fullName : `${member.firstName} ${member.lastName}`

					return (
						<>
							{/* Member Name */}
							<TableCell component="th" scope="row">{ fullName }</TableCell>

							{/* Funds */}
							<TableCell>
								{ formatters.currency.format(member.theme.amount || 0) }
								{ settings.useKioskFundsVoting && (votedTotal === member.theme.amount) && (
									<CheckIcon color='success' />
								) }
							</TableCell>

							{/* Chits */}
							<TableCell>
								{ member.theme.chits || 0 }
								{ settings.useKioskChitVoting && votedChits && (
									<CheckIcon color='success' />
								) }
							</TableCell>

							{/* Actions */}
							<TableCell padding="checkbox">
								<ContextMenu themeId={ themeId } member={ member } />
							</TableCell>
						</>

					)
				} }
				collapse={ member => (
					<Table size="small" aria-label="purchases"  sx={ { borderLeft: '1px solid #d7d7d7' } }>
						<TableHead>
							<TableRow>
								<TableCell>Code</TableCell>
								<TableCell>First Name</TableCell>
								<TableCell>Last Name</TableCell>
								<TableCell>Phone</TableCell>
								<TableCell>Email</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<TableRow>
								<TableCell component="th" scope="row">{ member.code }</TableCell>
								<TableCell>{ member.firstName }</TableCell>
								<TableCell>{ member.lastName }</TableCell>
								<TableCell>{ member.phone }</TableCell>
								<TableCell>{ member.email }</TableCell>
							</TableRow>
						</TableBody>
					</Table>
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
})

export default MembersTable

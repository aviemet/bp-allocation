import CheckIcon from "@mui/icons-material/Check"
import {
	Skeleton,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "@mui/material"
import { useParams } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import { useState } from "react"
import { useMembers, useSettings } from "/imports/api/providers"
import { formatters } from "/imports/lib/utils"

import { MemberMethods } from "/imports/api/methods"

import SortableTable from "/imports/ui/components/SortableTable"

import ContextMenu from "./ContextMenu"
import ConfirmationModal from "/imports/ui/components/Dialogs/ConfirmDelete"

interface HeadCell {
	id: string
	label: string
	sort?: boolean
	disablePadding?: boolean
}

const headCells: HeadCell[] = [
	{
		id: "fullName",
		label: "Member Name",
	},
	{
		id: "theme.amount",
		label: "Funds",
	},
	{
		id: "theme.chits",
		label: "Chits",
	},
	{
		id: "actions",
		label: "",
		sort: false,
		disablePadding: true,
	},
]

// TODO: Also, the sorting and icon indicators for voting status
// TODO: Would be cool to get the filter icon to allow filtring by keyword
//       So, choosing 'not voted' would filter out all those who have voted
const MembersTable = observer(() => {
	const { members, isLoading: membersLoading } = useMembers()
	const { settings } = useSettings()

	const [ modalOpen, setModalOpen ] = useState<boolean>(false)
	const [ modalHeader, setModalHeader ] = useState<string>("")
	const [ modalContent, setModalContent ] = useState<string>("")
	const [ modalAction, setModalAction ] = useState<(() => void) | undefined>(undefined)

	const { id: themeId } = useParams({ strict: false })

	// TODO: See about batching deletes
	const bulkDelete = (selected: string[], onSuccess: () => void) => {
		const plural = selected.length > 1

		setModalHeader(`Permanently unlink member${plural ? "s" : ""} from this theme?`)
		setModalContent(`This will permanently remove the member${plural ? "s" : ""} from this theme. It will not delete the Member record${plural ? "s" : ""}.`)
		// Need to curry the function since useState calls passed functions
		setModalAction( () => async () => {
			await Promise.all(selected.map(id => MemberMethods.removeMemberFromTheme.callAsync({ memberId: id, themeId: String(themeId) })))
			onSuccess()
		})
		setModalOpen(true)
	}

	const handleSearch = (value: string) => {
		if(members) members.searchFilter = value
	}

	if(membersLoading || !members) {
		return (
			<>
				<Skeleton height={ 100 } />
				<Skeleton variant="text" height={ 100 } />
				<Skeleton variant="text" height={ 100 } />
			</>
		)
	}

	const tableRows = members.filteredMembers
	const filterParams = members.searchFilter

	// TODO: Why isn't striping working now?
	return (
		<>
			<SortableTable
				title="Members"
				tableHeadTopRow={ [] }
				onBulkDelete={ bulkDelete }
				headCells={ headCells }
				rows={ tableRows }
				defaultOrderBy="createdAt"
				paginationCounts={ [10, 25, 50] }
				filterParams={ filterParams || null }
				onFilterParamsChange={ handleSearch }
				striped={ true }
				render={ (member: any) => {
					const votedTotal = (member.theme?.allocations || []).reduce((sum: number, allocation: any) => { return sum + (allocation.amount || 0) }, 0)
					const votedChits = (member.theme?.chitVotes || []).length > 0
					const fullName = member.fullName ? member.fullName : `${member.firstName || ""} ${member.lastName || ""}`

					return (
						<>
							{ /* Member Name */ }
							<TableCell component="th" scope="row">{ fullName }</TableCell>

							{ /* Funds */ }
							<TableCell>
								{ formatters.currency.format(member.theme?.amount || 0) }
								{ settings?.useKioskFundsVoting && (votedTotal === member.theme?.amount)
									? (
										<CheckIcon color="success" />
									)
									: null }
							</TableCell>

							{ /* Chits */ }
							<TableCell>
								{ member.theme?.chits || 0 }
								{ settings?.useKioskChitVoting && votedChits
									? (
										<CheckIcon color="success" />
									)
									: null }
							</TableCell>

							{ /* Actions */ }
							<TableCell padding="checkbox">
								<ContextMenu themeId={ String(themeId) } member={ member } />
							</TableCell>
						</>

					)
				} }
				collapse={ (member: any) => (
					<Table size="small" aria-label="purchases" sx={ { borderLeft: "1px solid #d7d7d7" } }>
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
								<TableCell component="th" scope="row">{ member.code || "" }</TableCell>
								<TableCell>{ member.firstName || "" }</TableCell>
								<TableCell>{ member.lastName || "" }</TableCell>
								<TableCell>{ member.phone || "" }</TableCell>
								<TableCell>{ member.email || "" }</TableCell>
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

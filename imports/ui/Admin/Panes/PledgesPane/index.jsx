import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'
import { Map } from 'immutable'

import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx'
import { useTheme, useMembers, useOrgs } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'
import { formatters } from '/imports/lib/utils'
import { format } from 'date-fns'

import styled from '@emotion/styled'
import {
	Box,
	CircularProgress,
	Grid,
	Paper,
	Skeleton,
	Stack,
	TableContainer,
	Table,
	TableHead,
	TableBody,
	TableFooter,
	TableRow,
	TableCell,
	Typography,
}  from '@mui/material'
import SortableTable from '/imports/ui/Components/SortableTable'
import ConfirmationModal from '/imports/ui/Components/Dialogs/ConfirmDelete'

// TODO: Investigate time issues with createdAt value

const headCells = [
	{
		id: 'org.title',
		label: 'Organization',
	},
	{
		id: 'member',
		label: 'Pledged By',
	},
	{
		id: 'amount',
		label: 'Amount',
	},
	{
		id: 'createdAt',
		label: 'Time',
		disablePadding: true,
	},
]

const Pledges = observer(({ hideAdminFields }) => {
	const { theme } = useTheme()
	const { members, isLoading: membersLoading } = useMembers()
	const { topOrgs, orgs, isLoading: orgsLoading } = useOrgs()

	const [ modalOpen, setModalOpen ] = useState(false)
	const [ modalHeader, setModalHeader ] = useState('')
	const [ modalContent, setModalContent ] = useState('')
	const [ modalAction, setModalAction ] = useState()

	const bulkDelete = (selected, onSuccess) => {
		const plural = selected.size > 1

		setModalHeader(`Permanently unlink member${plural ? 's' : ''} from this theme?`)
		setModalContent(`This will permanently remove the member${plural ? 's' : ''} from this theme. It will not delete the Member record${plural ? 's' : ''}.`)
		// Need to curry the function since useState calls passed functions
		setModalAction( () => () => {
			OrganizationMethods.removePledgeById.call({ themeId: theme._id , pledgeIds: selected })
			onSuccess()
		})
		setModalOpen(true)
	}

	if(orgsLoading || membersLoading || !members) return <CircularProgress />
	return (
		<>
			<Grid container spacing={ 2 }>
				<Grid item xs={ 12 } md={ 8 }>
					<SortableTable
						title="Pledges"
						onBulkDelete={ bulkDelete }
						headCells={ headCells }
						rows={ orgs.pledges }
						defaultOrderBy='createdAt'
						paginate={ false }
						striped={ true }
						selectable={ !hideAdminFields }
						render={ pledge => {
							const member = pledge.member ? members.values.find(value => value._id === pledge.member) : ''
							return (
								<>
									{/* Org Title */}
									<TableCell component="th" scope="row">{ pledge.org.title }</TableCell>

									{/* Member */}
									<TableCell>
										{ member && member.hasOwnProperty('formattedName') ?
											member.formattedName :
											''
										}
									</TableCell>

									{/* Amount */}
									<TableCell align="right">
										<Stack direction="row" justifyContent="space-between" alignItems="baseline">
											<div>$</div>
											<div>{ numeral(pledge.amount).format('0,0.00') }</div>
										</Stack>
									</TableCell>

									{/* Pledge Timestamp */}
									<TableCell>
										{ format(pledge.createdAt, 'hh:mm a') }
									</TableCell>
								</>
							)
						} }
					/>
				</Grid>

				<Grid item xs={ 12 } md={ 4 }>
					<Paper>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell colSpan={ 2 } align="center">
											<Typography component="p" variant="h6" >Totals</Typography>
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{ topOrgs.map(org => (
										<TableRow key={ org._id }>
											<TableCell key={ org._id }>{ org.title }</TableCell>
											<TableCell align="right">
												<Stack direction="row" justifyContent="space-between" alignItems="baseline">
													<Box sx={ { mr: 1 } }>$</Box>
													<Box>{ numeral(org.pledges.reduce((sum, pledge) => sum + pledge.amount, 0)).format('0,0.00') }</Box>
												</Stack>
											</TableCell>
										</TableRow>
									)) }
								</TableBody>
								<TableFooter>
									<TableRow>
										<TableCell align="right">Total:</TableCell>
										<TableCell>
											<Stack direction="row" justifyContent="space-between" alignItems="baseline">
												<Box sx={ { mr: 1 } }>$</Box>
												<Box>{ numeral(theme.pledgedTotal).format('0,0.00') }</Box>
											</Stack>
										</TableCell>
									</TableRow>
								</TableFooter>
							</Table>
						</TableContainer>
					</Paper>
				</Grid>
			</Grid>

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

Pledges.propTypes = {
	hideAdminFields: PropTypes.bool
}

Pledges.defaultProps = {
	hideAdminFields: false
}

export default Pledges

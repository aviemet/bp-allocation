import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useMembers } from '/imports/api/providers'

import {
	Container,
	Grid,
	Skeleton,
	Typography,
} from '@mui/material'

import SplitButton from '/imports/ui/Components/Buttons/SplitButton'
import MembersTable from './MembersTable'
import { observer } from 'mobx-react-lite'

const MembersPane = observer(() => {
	const { id } = useParams()
	const history = useHistory()

	const options = [
		{
			title: 'Add New Member',
			action: () => history.push(`/admin/${id}/members/new`)
		},
		{
			title: 'Import From CSV',
			action: () => history.push(`/admin/${id}/members/import`)
		},
	]

	return (
		<Container>
			<Grid container spacing={ 4 }>
				<Grid item xs={ 12 } md={ 8 }>
					<Typography component="h1" variant="h3">
							Members
					</Typography>
				</Grid>

				<Grid item xs={ 12 } md={ 4 } align="right">
					<SplitButton options={ options } />
				</Grid>

				<Grid item xs={ 12 }>
					<MembersTable />
				</Grid>
			</Grid>
		</Container>
	)
})

export default MembersPane

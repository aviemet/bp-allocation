import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { observer } from 'mobx-react-lite'
import {
	Button,
	CircularProgress,
	Grid,
	Typography,
} from '@mui/material'

import Breakdown from './Breakdown'
import AllocationsTable from './AllocationsTable'

import { ShowLeverageToggle } from '/imports/ui/Components/Toggles'
import { useTheme, useOrgs } from '/imports/api/providers'

const AllocationPane = observer(({ hideAdminFields }) => {
	const { theme, isLoading: themeLoading } = useTheme()
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	if(themeLoading || orgsLoading) return <CircularProgress />

	return (
		<Grid container spacing={ 2 }>

			{/* Breakdown Segment */}
			<Grid item xs={ 12 }>
				<Breakdown />
			</Grid>

			<Grid item xs={ 8 }>
				<Typography component='h2' variant="h2">Top { topOrgs.length } Funds Allocation</Typography>
			</Grid>

			{ !hideAdminFields && <>
				<Grid item xs={ 2 } align='right'>
					<Link to={ `/simulation/${theme._id}` } target='_blank'>
						<Button>Simulate</Button>
					</Link>
				</Grid>

				<Grid item xs={ 2 }>
					<ShowLeverageToggle />
				</Grid>
			</> }

			<Grid item xs={ 12 }>
				<AllocationsTable hideAdminFields={ hideAdminFields } />
			</Grid>
		</Grid>
	)
})

AllocationPane.propTypes = {
	hideAdminFields: PropTypes.bool
}

AllocationPane.defaultProps = {
	hideAdminFields: false
}

export default AllocationPane

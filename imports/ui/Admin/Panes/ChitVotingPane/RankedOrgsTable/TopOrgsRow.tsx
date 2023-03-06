import React from 'react'
import PropTypes from 'prop-types'
import { ThemeMethods } from '/imports/api/methods'
import {
	Stack,
	Switch,
	TableRow,
	TableCell,
} from '@mui/material'
import { roundFloat } from '/imports/lib/utils'
import SaveButton from './SaveButton'
import UnSaveButton from './UnSaveButton'
import { useTheme } from '/imports/api/providers'

const TopOrgsRow = ({ org, inTopOrgs, hideAdminFields, isSaved, isLocked }) => {
	const { theme } = useTheme()

	/**
	 * Manually pins an organization as a "Top Org"
	 */
	const topOrgToggle = (e, data) => {
		ThemeMethods.topOrgToggle.call({
			theme_id: theme.id,
			org_id: org._id,
		})
	}

	const rowSx = inTopOrgs ? { sx: { backgroundColor: 'table.highlight' } } : {}

	return (
		<TableRow { ...rowSx }>

			{ /* Title */ }
			<TableCell>
				<Stack direction="row" justifyContent="space-between" alignItems="baseline">
					<div>{ org.title }</div>

					{ /* Save and un-save buttons */ }
					{ !hideAdminFields && <>
						{ !inTopOrgs && <SaveButton org={ org } /> }
						{ isSaved && <UnSaveButton org={ org } />  }
					</> }
				</Stack>
			</TableCell>

			{ /* Votes */ }
			<TableCell align='center'>{ roundFloat(org.votes, 1) }</TableCell>

			{ /* Lock */ }
			<TableCell padding="checkbox">
				<Switch
					onChange={ topOrgToggle }
					checked={ isLocked || false }
					disabled={ !!isSaved || false }
				/>
			</TableCell>

		</TableRow>
	)
}

TopOrgsRow.propTypes = {
	org: PropTypes.object,
	inTopOrgs: PropTypes.bool,
	hideAdminFields: PropTypes.bool,
	isSaved: PropTypes.bool,
	isLocked: PropTypes.bool,
}

export default TopOrgsRow

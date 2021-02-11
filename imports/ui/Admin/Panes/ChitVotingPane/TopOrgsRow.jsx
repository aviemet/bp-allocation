import React from 'react'
import PropTypes from 'prop-types'

import { ThemeMethods } from '/imports/api/methods'

import { Table, Checkbox } from 'semantic-ui-react'

import { roundFloat } from '/imports/lib/utils'

import SaveButton from './SaveButton'
import UnSaveButton from './UnSaveButton'

const TopOrgsRow = props => {
	
	/**
	 * Manually pins an organization as a "Top Org"
	 */
	const topOrgToggle = (e, data) => {
		ThemeMethods.topOrgToggle.call({
			theme_id: props.themeId,
			org_id: props.org._id
		})
	}

	return(
		<Table.Row positive={ props.inTopOrgs }>

			{/* Title */}
			<Table.Cell>
				{/* Save and unsave buttons */}
				{ !props.hideAdminFields && <React.Fragment>
					{ !props.inTopOrgs && <SaveButton org={ props.org } /> }
					{ props.isSaved &&
					<span style={ { float: 'right' } }>
						<UnSaveButton org={ props.org } />
					</span> }
				</React.Fragment> }

				{ props.org.title }

			</Table.Cell>

			{/* Votes */}
			<Table.Cell textAlign='center'>{ roundFloat(props.org.votes, 1) }</Table.Cell>

			{/* Lock */}
			<Table.Cell>
				<Checkbox
					toggle
					onChange={ topOrgToggle }
					checked={ props.isLocked || false }
					disabled={ !!props.isSaved || false }
				/>
			</Table.Cell>
			
		</Table.Row>
	)
}

TopOrgsRow.propTypes = {
	themeId: PropTypes.string,
	org: PropTypes.object,
	inTopOrgs: PropTypes.bool,
	hideAdminFields: PropTypes.bool,
	isSaved: PropTypes.bool,
	isLocked: PropTypes.bool
}

export default TopOrgsRow

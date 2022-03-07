import React from 'react'
import PropTypes from 'prop-types'

import useTheme from '@mui/material/styles/useTheme'
import { Button, Chip, Stack } from '@mui/material'

import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'
import { PresentationSettingsMethods } from '/imports/api/methods'

const PresentationNavButton = observer(({ page, active, onClick, label, Icon, ...rest }) => {
	const muiTheme = useTheme()
	const { settings } = useSettings()

	const changeCurrentPage = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				currentPage: page
			}
		})
	}

	// onClick passthrough
	const doOnClick = (e, data) => {
		changeCurrentPage(e, data)
		if(onClick) onClick()
		e.currentTarget.blur()
	}

	// Highlight the active page button
	const activePage = active !== false && settings.currentPage === page

	return (
		<Button
			fullWidth
			sx={ {
				height: 120,
				mb: 3,
				backgroundColor: activePage ? muiTheme.palette.success.main : muiTheme.palette.grey[300]
			} }
			onClick={ doOnClick }
			{ ...rest }
		>
			<Stack alignItems="center">
				<Icon sx={ {
					fontSize: '3.5rem',
					color: activePage ? muiTheme.palette.success.contrastText : muiTheme.palette.text.secondary
				} } />
				<Chip label={ label } sx={ { backgroundColor: activePage ? muiTheme.palette.success.light : null } } />
			</Stack>
		</Button>
	)
})

PresentationNavButton.propTypes = {
	page: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	Icon: PropTypes.any.isRequired,
	onClick: PropTypes.func,
	rest: PropTypes.any
}

export default PresentationNavButton

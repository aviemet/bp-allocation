import React from 'react'
import useTheme from '@mui/material/styles/useTheme'
import { Button, type ButtonProps, Chip, Stack } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useSettings } from '/imports/api/providers'
import { PresentationSettingsMethods } from '/imports/api/methods'

interface PresentationNavButtonProps extends ButtonProps {
	page: string
	label: string
	Icon: Icon
	active?: false
	onClick?: () => void
}

const PresentationNavButton = observer(({ page, active, onClick, label, Icon, ...props }: PresentationNavButtonProps) => {
	const muiTheme = useTheme()
	const { settings } = useSettings()

	// onClick passthrough
	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				currentPage: page,
			},
		})

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
				backgroundColor: activePage ? muiTheme.palette.success.main : muiTheme.palette.grey[300],
			} }
			onClick={ handleClick }
			{ ...props }
		>
			<Stack alignItems="center">
				<Icon sx={ {
					fontSize: '3.5rem',
					color: activePage ? muiTheme.palette.success.contrastText : muiTheme.palette.text.secondary,
				} } />
				<Chip label={ label } sx={ { backgroundColor: activePage ? muiTheme.palette.success.light : null } } />
			</Stack>
		</Button>
	)
})

export default PresentationNavButton

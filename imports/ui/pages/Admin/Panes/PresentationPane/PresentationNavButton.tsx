import { Button, Chip, Stack, type ButtonProps } from "@mui/material"
import useTheme from "@mui/material/styles/useTheme"
import { observer } from "mobx-react-lite"
import { type ElementType, type MouseEvent } from "react"
import { useSettings } from "/imports/api/providers"
import { PresentationSettingsMethods } from "/imports/api/methods"

interface PresentationNavButtonProps extends Omit<ButtonProps, "onClick"> {
	page: string
	label: string
	Icon: ElementType
	active?: boolean
	onClick?: () => void
}

const PresentationNavButton = observer(({
	page,
	active,
	onClick,
	label,
	Icon,
	...rest
}: PresentationNavButtonProps) => {
	const muiTheme = useTheme()
	const settingsContext = useSettings()
	const settings = settingsContext?.settings
	if(!settings) return null

	const changeCurrentPage = () => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				currentPage: page,
			},
		})
	}

	// 	onClick passthrough
	const doOnClick = (e: MouseEvent<HTMLButtonElement>) => {
		changeCurrentPage()
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
			onClick={ doOnClick }
			{ ...rest }
		>
			<Stack alignItems="center">
				<Icon sx={ {
					fontSize: "3.5rem",
					color: activePage ? muiTheme.palette.success.contrastText : muiTheme.palette.text.secondary,
				} } />
				<Chip label={ label } sx={ { backgroundColor: activePage ? muiTheme.palette.success.light : null } } />
			</Stack>
		</Button>
	)
})

export default PresentationNavButton

import { Button, Chip, Stack, useTheme, type ButtonProps } from "@mui/material"
import { type ElementType, type MouseEvent } from "react"
import { useSettings } from "/imports/api/hooks"
import { PresentationSettingsMethods } from "/imports/api/methods"

interface PresentationNavButtonProps extends Omit<ButtonProps, "onClick"> {
	page: string
	label: string
	Icon: ElementType
	active?: boolean
	onClick?: () => void
}

const PresentationNavButton = ({
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

	const changeCurrentPage = async () => {
		await PresentationSettingsMethods.update.callAsync({
			id: settings._id,
			data: {
				currentPage: page,
			},
		})
	}

	const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
		const target = e.currentTarget
		await changeCurrentPage()

		onClick?.()

		if(target) {
			target.blur()
		}
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
}

export default PresentationNavButton

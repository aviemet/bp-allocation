import Button from "@mui/material/Button"
import { ThemeMethods } from "/imports/api/methods"
import { useTheme } from "/imports/api/providers"

const ResetMessageStatusButton = () => {
	const { theme } = useTheme()

	if(!theme) return null

	return (
		<Button color="warning" onClick={ () => ThemeMethods.resetMessageStatus.call(theme._id) }>Reset Sent Status for All Messages</Button>
	)
}

export default ResetMessageStatusButton

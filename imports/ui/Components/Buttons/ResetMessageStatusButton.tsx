import Button from "@mui/material/Button"
import React from "react"
import { ThemeMethods } from "/imports/api/methods"
import { useTheme } from "/imports/api/providers"

const ResetMessageStatusButton = () => {
	const { theme } = useTheme()

	return (
		<Button color="warning" onClick={ () => ThemeMethods.resetMessageStatus.call(theme._id) }>Reset Sent Status for All Messages</Button>
	)
}

export default ResetMessageStatusButton

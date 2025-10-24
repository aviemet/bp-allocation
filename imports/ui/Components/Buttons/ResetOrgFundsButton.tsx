import React from "react"
import Button from "@mui/material/Button"
import { ThemeMethods } from "/imports/api/methods"
import { useTheme } from "/imports/api/providers"

// TODO: Needs a confirmation dialog

const ResetOrgFundsButton = () => {
	const { theme } = useTheme()

	const resetOrgFunds = () => {
		ThemeMethods.resetAllOrgFunds.call(theme._id)
	}

	return (
		<Button color="warning" onClick={ resetOrgFunds }>Reset Funds for All Orgs</Button>
	)
}

export default ResetOrgFundsButton

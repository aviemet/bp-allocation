import Button from "@mui/material/Button"
import { ThemeMethods } from "/imports/api/methods"
import { useTheme } from "/imports/api/providers"

const ResetOrgFundsButton = () => {
	const { theme } = useTheme()

	const resetOrgFunds = () => {
		if(!theme) return
		ThemeMethods.resetAllOrgFunds.call(theme._id)
	}

	if(!theme) return null

	return (
		<Button color="warning" onClick={ resetOrgFunds }>Reset Funds for All Orgs</Button>
	)
}

export default ResetOrgFundsButton

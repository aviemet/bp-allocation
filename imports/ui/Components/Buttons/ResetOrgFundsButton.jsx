import React from 'react'
import { Button } from 'semantic-ui-react'
import { ThemeMethods } from '/imports/api/methods'
import { useTheme } from '/imports/api/providers'

// TODO: Needs a confirmation dialog

const ResetOrgFundsButton = () => {
	const { theme } = useTheme()

	const resetOrgFunds = () => {
		ThemeMethods.resetAllOrgFunds.call(theme._id)
	}

	return (
		<Button onClick={ resetOrgFunds }>Reset Funds for All Orgs</Button>
	)
}

export default ResetOrgFundsButton
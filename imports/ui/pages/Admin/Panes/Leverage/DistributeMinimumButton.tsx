import { Button } from "@mui/material"
import { useState } from "react"
import { useOrgs, useTheme } from "/imports/api/hooks"
import { ThemeMethods } from "/imports/api/methods"
import { roundFloat } from "/imports/lib/utils"

type LeverageDistribution = {
	_id: string
	leverageFunds?: number
}

export const DistributeMinimumButton = () => {
	const { theme } = useTheme()
	const { topOrgs } = useOrgs()
	const [isLoading, setIsLoading] = useState(false)

	const distributeMinimum = async () => {
		if(!theme ||
			!theme.minLeverageAmountActive ||
			theme.minLeverageAmount === undefined ||
			theme.minLeverageAmount === 0 ||
			isLoading
		) return

		setIsLoading(true)
		try {
			const minimumOrgFunds: LeverageDistribution[] = []
			topOrgs.forEach(org => {
				const minimumTarget = theme.minLeverageAmount || 0
				const currentAllocated = org.allocatedFunds || 0
				const need = org.need || 0
				const remainingLeverage = theme.leverageRemaining || 0
				const difference = Math.max(minimumTarget - currentAllocated, 0)
				minimumOrgFunds.push({
					_id: org._id,
					leverageFunds: roundFloat(Math.min(difference, need, remainingLeverage)),
				})
			})

			await ThemeMethods.saveLeverageSpread.callAsync({
				orgs: minimumOrgFunds,
				themeId: theme._id,
				distributionType: "minimum",
			})
		} finally {
			setIsLoading(false)
		}
	}

	const resetMinimum = async () => {
		if(!theme || isLoading) return

		setIsLoading(true)
		try {
			await ThemeMethods.resetLeverage.callAsync(theme._id)
		} finally {
			setIsLoading(false)
		}
	}

	if(theme?.minimumLeverageDistributed && !theme?.finalLeverageDistributed) {
		return (
			<Button color="warning" onClick={ resetMinimum } disabled={ isLoading }>
				Reset Minimum Distribution
			</Button>
		)
	}

	const isDisabled = !theme ||
		!theme.minLeverageAmountActive ||
		theme.minLeverageAmount === undefined ||
		theme.minLeverageAmount === 0 ||
		theme?.finalLeverageDistributed ||
		isLoading

	return (
		<Button
			onClick={ distributeMinimum }
			disabled={ isDisabled }
		>
			Distribute Minimum $
		</Button>
	)
}

export default DistributeMinimumButton

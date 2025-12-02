import { Button } from "@mui/material"
import { useState } from "react"
import { useTheme, useSettings } from "/imports/api/hooks"
import { PresentationSettingsMethods, ThemeMethods } from "/imports/api/methods"
import { type LeverageRound } from "/imports/lib/Leverage"

interface DistributeLeverageButtonProps {
	leverageDistributed: boolean
	rounds: LeverageRound[]
}

export const DistributeLeverageButton = ({ leverageDistributed, rounds }: DistributeLeverageButtonProps) => {
	const { theme } = useTheme()
	const { settings } = useSettings()
	const [isLoading, setIsLoading] = useState(false)

	const saveLeverageSpread = async () => {
		if(!theme || rounds.length === 0 || isLoading) return

		setIsLoading(true)
		try {
			const lastRound = rounds[rounds.length - 1]
			await ThemeMethods.saveLeverageSpread.callAsync({
				orgs: lastRound.orgs,
				themeId: theme._id,
				distributionType: "final",
			})

			// Hide the leverage bar after
			if(!settings) return
			setTimeout(async () => {
				await PresentationSettingsMethods.update.callAsync({
					id: settings._id,
					data: {
						leverageVisible: false,
					},
				})
			}, 3000)
		} finally {
			setIsLoading(false)
		}
	}

	const resetLeverage = async () => {
		if(!theme || isLoading) return null

		setIsLoading(true)
		try {
			await ThemeMethods.resetLeverage.callAsync(theme._id)
		} finally {
			setIsLoading(false)
		}
	}

	if(leverageDistributed) {
		return (
			<Button color="warning" onClick={ resetLeverage } disabled={ isLoading }>
				Reset Leverage Distribution
			</Button>
		)
	}

	const canDistributeFinal = theme &&
		!theme.finalLeverageDistributed &&
		(!theme.minLeverageAmountActive || theme.minimumLeverageDistributed)

	return (
		<Button
			onClick={ saveLeverageSpread }
			disabled={ !canDistributeFinal || isLoading }
		>
			Submit Final Values
		</Button>
	)
}

export default DistributeLeverageButton

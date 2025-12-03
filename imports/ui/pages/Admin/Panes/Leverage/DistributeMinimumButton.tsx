import { Button } from "@mui/material"
import { useEffect, useRef, useState } from "react"
import { useOrgs, useTheme } from "/imports/api/hooks"
import { ThemeMethods } from "/imports/api/methods"
import { roundFloat } from "/imports/lib/utils"

type LeverageDistribution = {
	_id: string
	leverageFunds?: number
}

const MIN_LOADING_TIME_MS = 1000

export const DistributeMinimumButton = () => {
	const { theme } = useTheme()
	const { topOrgs } = useOrgs()
	const [isLoading, setIsLoading] = useState(false)
	const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const lockedStateRef = useRef<"distribute" | "reset" | null>(null)

	const setLoadingWithMinimum = (loading: boolean, state: "distribute" | "reset") => {
		if(loadingTimerRef.current) {
			clearTimeout(loadingTimerRef.current)
			loadingTimerRef.current = null
		}

		if(loading) {
			lockedStateRef.current = state
			setIsLoading(true)
		} else {
			loadingTimerRef.current = setTimeout(() => {
				setIsLoading(false)
				lockedStateRef.current = null
				loadingTimerRef.current = null
			}, MIN_LOADING_TIME_MS)
		}
	}

	useEffect(() => {
		return () => {
			if(loadingTimerRef.current) {
				clearTimeout(loadingTimerRef.current)
			}
		}
	}, [])

	const distributeMinimum = async () => {
		if(!theme ||
			!theme._id ||
			!theme.minLeverageAmountActive ||
			theme.minLeverageAmount === undefined ||
			theme.minLeverageAmount === 0 ||
			isLoading
		) return

		setLoadingWithMinimum(true, "distribute")
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
			setLoadingWithMinimum(false, "distribute")
		}
	}

	const resetMinimum = async () => {
		if(!theme || !theme._id || isLoading) return

		setLoadingWithMinimum(true, "reset")
		try {
			await ThemeMethods.resetLeverage.callAsync(theme._id)
		} finally {
			setLoadingWithMinimum(false, "reset")
		}
	}

	const shouldShowReset = theme?.minimumLeverageDistributed && !theme?.finalLeverageDistributed
	const showReset = isLoading ? lockedStateRef.current === "reset" : shouldShowReset

	if(showReset) {
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

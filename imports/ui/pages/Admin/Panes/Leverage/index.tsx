import {
	Box,
	Button,
	Grid,
	Paper,
	Stack,
	Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { observer } from "mobx-react-lite"
import numeral from "numeral"

import { useTheme, useOrgs } from "/imports/api/providers"
import { ThemeMethods } from "/imports/api/methods"
import LeverageObject from "/imports/lib/Leverage"


import ResultsTable from "./ResultsTable"
import RoundTable from "./RoundTable"

interface LeverageProps {
	hideAdminFields?: boolean
}

const Leverage = observer(({ hideAdminFields }: LeverageProps) => {
	const { theme } = useTheme()
	const { topOrgs } = useOrgs()

	const leverage = new LeverageObject(topOrgs, theme.leverageRemaining)
	const rounds = leverage.getLeverageSpreadRounds()

	const saveLeverageSpread = (lastRound) => {
		ThemeMethods.saveLeverageSpread.call(lastRound.orgs)
	}

	const resetLeverage = () => {
		ThemeMethods.resetLeverage.call(theme._id)
	}

	// const rounds = getLeverageSpreadRounds(theme.leverageRemaining)

	if(rounds.length === 0) {
		return (
			<>
				<Typography component="h1" variant="h3">Not enough leverage to assign to organizations</Typography>
				<p>Check if amount has been entered to the &apos;Total Pot&apos; field in Theme Settings</p>
			</>
		)
	}

	const orgSpreadSum = topOrgs.reduce((sum, org) => { return sum + org.leverageFunds }, 0)
	const roundSpreadSum = rounds[rounds.length - 1].orgs.reduce((sum, org) => { return sum + org.leverageFunds }, 0)

	// console.log({ orgSpreadSum, roundSpreadSum })

	const leverageDistributed = orgSpreadSum === roundSpreadSum && roundSpreadSum > 0

	return (
		<>
			<StageCard>
				<Stack direction="row" justifyContent="space-between" alignItems="center">
					<Typography component="h2" variant="h3">Final Distribution</Typography>

					<div>Leverage Remaining: { numeral(leverage.finalRoundAllocation(rounds)).format("$0,0.00") }</div>
					{ !hideAdminFields && <>
						{ !leverageDistributed
							? (
								<Button onClick={ () => saveLeverageSpread(rounds[rounds.length - 1]) }>
									Submit Final Values
								</Button>
							)
							: (
								<Button color="warning" onClick={ resetLeverage }>
									Reset Leverage Distribution
								</Button>
							) }
					</> }
				</Stack>
				<ResultsTable round={ rounds[rounds.length - 1] } />
			</StageCard>

			{ rounds.map((round, i) => (
				<StageCard key={ i }>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography component="h2" variant="h3">Round { i + 1 }</Typography>
						<div>
							<span>
								Leverage Remaining:
								<b>{ numeral(round.leverageRemaining).format("$0,0.00") }</b>
							</span>
							<br/>
							<span>
								Remaining Orgs Sum:
								<b>{ numeral(round.sumRemainingOrgs).format("$0,0.00") }</b>
							</span>
						</div>
					</Stack>
					<RoundTable orgs={ round.orgs } />
				</StageCard>
			)) }
		</>
	)
})

const StageCard = styled(Paper)(({ theme }) => ({
	padding: 16,
	marginBottom: 16,
}))

export default Leverage

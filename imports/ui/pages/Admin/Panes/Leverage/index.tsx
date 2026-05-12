import {
	Container,
	Paper,
	Stack,
	Typography,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import numeral from "numeral"

import { useTheme, useOrgs } from "/imports/api/hooks"
import { Leverage as LeverageObject } from "/imports/lib/Leverage"

import { DistributeLeverageButton } from "./DistributeLeverageButton"
import { ResultsTable } from "./ResultsTable"
import { RoundTable } from "./RoundTable"
import { ShowLeverageToggle } from "/imports/ui/components/Toggles"

interface LeverageProps {
	hideAdminFields?: boolean
}

export const LeveragePane = ({ hideAdminFields }: LeverageProps) => {
	const { theme } = useTheme()
	const { topOrgs } = useOrgs()

	if(!theme) return null

	const leverage = new LeverageObject(topOrgs, Number(theme.leverageRemaining))

	const rounds = leverage.getLeverageSpreadRounds()


	if(rounds.length === 0) {
		return (
			<>
				<Typography component="h1" variant="h3">Not enough leverage to assign to organizations</Typography>
				<p>Check if amount has been entered to the &apos;Total Pot&apos; field in Theme Settings</p>
			</>
		)
	}

	return (
		<Container>
			{ !hideAdminFields && <StageCard>
				<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center" } }>
					<ShowLeverageToggle />
					<Stack direction="row" sx={ { gap: 2 } }>
						<DistributeLeverageButton
							rounds={ rounds }
						/>
					</Stack>
				</Stack>
			</StageCard> }

			<StageCard>
				<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center" } }>
					<Typography component="h2" variant="h3">Final Distribution</Typography>
					<div>Leverage Remaining: { numeral(leverage.finalRoundAllocation()).format("$0,0") }</div>
				</Stack>
				<ResultsTable round={ rounds[rounds.length - 1] } />
			</StageCard>

			{ rounds.map((round, i) => (
				<StageCard key={ i }>
					<Stack direction="row" sx={ { justifyContent: "space-between", alignItems: "center" } }>
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
		</Container>
	)
}

const StageCard = styled(Paper)(() => ({
	padding: 16,
	marginBottom: 16,
}))


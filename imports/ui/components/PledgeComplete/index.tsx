import styled from "@emotion/styled"
import { Button, Container, Typography } from "@mui/material"
import numeral from "numeral"

import { COLORS } from "/imports/lib/presentation/global"
import { useTheme, type OrgDataWithComputed } from "/imports/api/hooks"
import {
	formatMatchRatioFromMultiplier,
	previewMatchedPrincipal,
} from "/imports/lib/allocation/pledgeMatching"
import { Loading } from "../Loading"

export interface PledgeCompleteData {
	amount: number
	org: OrgDataWithComputed
	matchEligible?: boolean
}

export type PledgeCompleteMatchKind = "standard" | "inPerson"

interface PledgeCompleteProps {
	data: PledgeCompleteData
	resetData: () => void
	matchKind?: PledgeCompleteMatchKind
}

export const PledgeComplete = ({ data, resetData, matchKind = "standard" }: PledgeCompleteProps) => {
	const { theme, themeLoading } = useTheme()

	if(themeLoading) {
		return <Loading />
	}

	const matchMultiplier = matchKind === "inPerson"
		? (theme?.inPersonMatchRatio ?? 1)
		: (theme?.matchRatio ?? 1)
	const formattedAmount = numeral(data.amount).format("$0,0[.]00")
	const matchEligible = data.matchEligible ?? true
	const preview = previewMatchedPrincipal({
		pledgeAmount: data.amount,
		orgNeed: data.org.need,
		matchMultiplier,
		remainingLeverage: Number(theme?.leverageRemaining || 0),
		matchEligible,
	})
	const formattedMatch = numeral(preview.leverageBonus).format("$0,0[.]00")
	const formattedNeed = numeral(data.org.need).format("$0,0[.]00")
	const matchRatioLabel = formatMatchRatioFromMultiplier(matchMultiplier)

	return (
		<PledgeCompleteContainer>
			<Typography component="h1" variant="h4" align="center">Thank You For Your Pledge!</Typography>
			<p>
				Your generous donation to <b><u>{ data.org.title }</u></b> of <b>{ formattedAmount }</b>
				{ preview.overNeedNoMatch && (
					<> will go to the organization in full. They still need { formattedNeed } to be fully funded, and your pledge covers that gap, so it will not receive leverage matching.</>
				) }
				{ preview.orgFullyFunded && (
					<> will go to the organization in full. { data.org.title } is already fully funded, so it will not receive leverage matching.</>
				) }
				{ preview.poolExhausted && (
					<> will go to the organization in full. The leverage pool is exhausted, so it will not receive a match.</>
				) }
				{ !preview.overNeedNoMatch && !preview.orgFullyFunded && !preview.poolExhausted && matchMultiplier > 1 && preview.leverageBonus > 0 && (
					<>
						{ " " }
						will receive { formattedMatch } matched at { matchRatioLabel } from the leverage pot.
					</>
				) }
				{ !preview.overNeedNoMatch && !preview.orgFullyFunded && !preview.poolExhausted && (matchMultiplier <= 1 || preview.leverageBonus <= 0) && "." }
			</p>
			{ (preview.askLimited || preview.poolLimited) && !preview.overNeedNoMatch && (
				<PartialNote>
					Your pledge amount still goes to the org in full; only part of it receives leverage matching.
				</PartialNote>
			) }
			<AmendVoteButton
				disabled={ false }
				onClick={ resetData }
			>Pledge Again</AmendVoteButton>
		</PledgeCompleteContainer>
	)
}

const PledgeCompleteContainer = styled(Container)`
	flex: 1;
	min-height: 0;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;
	padding: 1rem auto;

	p {
		margin-top: 20px;
		font-size: 1.25rem;
		color: white;
	}
`

const PartialNote = styled.p`
	color: #ffc107 !important;
	text-align: center;
	font-style: italic;
`

const AmendVoteButton = styled(Button)`
	text-align: center;
	background-color: ${COLORS.blue};
	color: white;
	border: 2px solid #fff;
	font-size: 2rem;
	text-transform: uppercase;
	margin-bottom: 10px;
	padding-bottom: 0;
`

import styled from "@emotion/styled"
import { Button, Container, Stack, Typography } from "@mui/material"
import numeral from "numeral"

import { COLORS } from "/imports/lib/global"
import { useTheme, type OrgDataWithComputed } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"

export interface CompletedPledge {
	amount: number
	org: OrgDataWithComputed
}

interface InPersonPledgeCompleteProps {
	data: CompletedPledge
	resetData: () => void
	onSignOut: () => void
}

export const InPersonPledgeComplete = ({ data, resetData, onSignOut }: InPersonPledgeCompleteProps) => {
	const { theme, themeLoading } = useTheme()

	if(themeLoading) return <Loading />

	const ratio = theme?.inPersonMatchRatio ?? 0
	const formattedAmount = numeral(data.amount).format("$0,0[.]00")
	const formattedTotal = numeral(data.amount * ratio).format("$0,0[.]00")
	const remaining = Number(theme?.leverageRemaining || 0)
	const partialMatchLikely = remaining < data.amount * Math.max(0, ratio - 1)

	return (
		<PledgeCompleteContainer>
			<Typography component="h1" variant="h4" align="center">Thank You For Your Pledge!</Typography>
			<p>
				Your generous donation to <b><u>{ data.org.title }</u></b> of <b>{ formattedAmount }</b>
				{ ratio > 1 && ` is matched at ${Math.max(0, ratio - 1)}:1 from the leverage pot, bringing them up to ${formattedTotal} closer to being fully funded.` }
			</p>
			{ partialMatchLikely && (
				<PartialNote>
					The leverage pool is nearly exhausted, so part of this pledge may receive a reduced match. Your pledge amount still goes to the org in full.
				</PartialNote>
			) }
			<Stack direction="row" spacing={ 2 }>
				<AmendVoteButton onClick={ resetData }>Pledge Again</AmendVoteButton>
				<SignOutButton onClick={ onSignOut }>Sign Out</SignOutButton>
			</Stack>
		</PledgeCompleteContainer>
	)
}

const PledgeCompleteContainer = styled(Container)`
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
	color: #FFC107 !important;
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

const SignOutButton = styled(Button)`
	text-align: center;
	color: white;
	border: 2px solid #fff;
	font-size: 1.5rem;
	text-transform: uppercase;
	margin-bottom: 10px;
`

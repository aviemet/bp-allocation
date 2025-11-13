import styled from "@emotion/styled"
import { Button, Container, Typography } from "@mui/material"
import numeral from "numeral"
import { COLORS } from "/imports/lib/global"
import { useTheme } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"
import { type OrgStore } from "/imports/api/stores"

interface TopupCompleteData {
	amount: number
	org: OrgStore
}

interface VotingCompleteProps {
	data: TopupCompleteData
	resetData: () => void
}

const VotingComplete = ({ data, resetData }: VotingCompleteProps) => {
	const { theme, themeLoading } = useTheme()

	if(themeLoading) return <Loading />
	const formatted = {
		amount: numeral(data.amount).format("$0,0[.]00"),
		total: numeral(data.amount * (theme?.matchRatio ?? 0)).format("$0,0[.]00"),
	}

	return (
		<TopupCompleteContainer>
			<Typography component="h1" variant="h4" align="center">Thank You For Your Pledge!</Typography>
			<p>Your generous donation to <b><u>{ data.org.title }</u></b> of <b>{ formatted.amount }</b> was matched by the remaining leverage bringing them <b>{ formatted.total }</b> closer to being fully funded.</p>

		<AmendVoteButton
			disabled={ false }
			onClick={ resetData }
		>Pledge Again</AmendVoteButton>
		</TopupCompleteContainer>
	)
}

const TopupCompleteContainer = styled(Container)`
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

export default VotingComplete

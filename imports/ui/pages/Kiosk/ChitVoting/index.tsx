import styled from "@emotion/styled"
import { Container, Button, Typography } from "@mui/material"
import { forEach } from "lodash"
import { observer } from "mobx-react-lite"
import { useState, useEffect, useMemo } from "react"

import { useData, useSettings, useOrgs } from "/imports/api/providers"

import { OrgCardContainer } from "/imports/ui/components/Cards"
import Countdown from "../Countdown"
import VotingComplete from "../VotingComplete"
import { useVoting } from "../VotingContext"
import { COLORS } from "/imports/lib/global"
import ChitVoteOrgCard from "./ChitVoteOrgCard"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"
import { VotingSource } from "/imports/api/methods/MemberMethods"
import { shuffleWithSeed } from "/imports/lib/shuffleWithSeed"

interface ChitVotingKioskProps {
	user: MemberWithTheme
	source: VotingSource
}

const ChitVotingKiosk = observer(({ user, source }: ChitVotingKioskProps) => {
	const data = useData()
	const { settings } = useSettings()
	const { orgs } = useOrgs()
	const { chits, saveChits, member } = useVoting()

	const [ votingComplete, setVotingComplete ] = useState(false)
	const [ countdownVisible, setCountdownVisible ] = useState(false)
	const [ isCounting, setIsCounting ] = useState(false)

	const displayCountDown = () => {
		setCountdownVisible(true)
		setIsCounting(true)
	}

	useEffect(() => {
		// Display countdown if user is on voting screen when voting becomes disabled
		if(settings?.chitVotingActive === false) displayCountDown()
	}, [settings?.chitVotingActive])

	const handleFinalizeVote = () => {
		saveChits(source)
		setVotingComplete(true)
	}

	const shuffledOrgs = useMemo(() => {
		if(!orgs) return []

		const sorted = orgs.values.slice().sort((a, b) => a._id.localeCompare(b._id))
		return shuffleWithSeed(sorted, user._id).map(org => <ChitVoteOrgCard key={ org._id } org={ org } />)
	}, [orgs, user._id])

	let chitsSum = 0
	forEach(chits, value => chitsSum += value)
	const remaining = (member.theme?.chits || 0) - chitsSum
	const buttonDisabled = remaining !== 0

	if(votingComplete) {
		return <VotingComplete setVotingComplete={ setVotingComplete } />
	}

	const memberName = user.firstName ? user.firstName : user.fullName

	return (
		<OrgsContainer>

			<Typography variant="h4" component="h1" align="center">
				{ user.firstName && "Voting for" } { memberName }
			</Typography>

			{ countdownVisible && <Countdown seconds={ data.votingRedirectTimeout } isCounting={ isCounting } /> }

			<Container maxWidth="xl" sx={ { height: "100%" } }>
				<OrgCardContainer
					cols={ 2 }
					sx={ { paddingBottom: "clamp(0rem, -58.1818rem + 90.9091vh, 10rem)" } }
				>
					{ shuffledOrgs }
				</OrgCardContainer>
			</Container>

			<>
				<h2>ROUND 1 VOTES LEFT: <NumberFormat>{ remaining }</NumberFormat></h2>

				<FinalizeButton
					disabled={ buttonDisabled }
					onClick={ handleFinalizeVote }
				>
					Finalize Vote
				</FinalizeButton>
			</>
		</OrgsContainer>
	)
})

const OrgsContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	flex: 1;
	padding-top: 16px;
	padding-bottom: 16px;
	height: 100%;

	&& p{
		line-height: 1em;
	}
`

const FinalizeButton = styled(Button)({
	width: "100%",
	textAlign: "center" as const,
	color: "white",
	border: "2px solid #fff",
	fontSize: "2rem",
	textTransform: "uppercase" as const,
	backgroundColor: COLORS.blue,

	"&.Mui-disabled": {
		backgroundColor: COLORS.blue,
	},
})

const NumberFormat = styled.span`
	display: inline-block;
`

export default ChitVotingKiosk

import React, { useState, useEffect, useMemo } from "react"
import PropTypes from "prop-types"
import { forEach, shuffle } from "lodash"
import { observer } from "mobx-react-lite"
import { useData, useSettings, useOrgs } from "/imports/api/providers"
import { FundsVoteContext } from "/imports/ui/Kiosk/VotingContext"
import { Container, Button, Typography } from "@mui/material"
import styled from "@emotion/styled"
import { OrgCardContainer } from "/imports/ui/Components/Cards"
import VotingComplete from "../VotingComplete"
import Countown from "../Countdown"

import { COLORS } from "/imports/lib/global"
import ChitVoteOrgCard from "/imports/ui/Kiosk/ChitVoting/ChitVoteOrgCard"

const ChitVotingKiosk = observer(props => {
	const data = useData()
	const { settings } = useSettings()
	const { orgs } = useOrgs()

	// const voted = props.user.theme.chitVotes.some(org => org.votes > 0)

	// const [voted, setVoted] = useState(false)

	const [ votingComplete, setVotingComplete ] = useState(false)
	const [ countdownVisible, setCountdownVisible ] = useState(false)
	const [ isCounting, setIsCounting ] = useState(false)

	const displayCountDown = () => {
		setCountdownVisible(true)
		setIsCounting(true)
	}

	useEffect(() => {
		// Display countdown if user is on voting screen when voting becomes disabled
		if(!settings.chitVotingActive) displayCountDown()
	}, [settings.chitVotingActive])

	const memberName = props.user.firstName ? props.user.firstName : props.user.fullName

	const shuffledOrgs = useMemo(() => {
		return shuffle(orgs.values.map(org => {
			return <ChitVoteOrgCard key={ org._id } org={ org } />
		}))
	}, [])

	if(votingComplete) {
		return <VotingComplete setVotingComplete={ setVotingComplete } />
	}

	return (
		<OrgsContainer>

			<Typography variant="h4" component="h1" align="center">
				{ props.user.firstName && "Voting for" } { memberName }
			</Typography>

			{ countdownVisible && <Countown seconds={ data.votingRedirectTimeout } isCounting={ isCounting } /> }

			<Container maxWidth="xl" sx={ { height: "100%" } }>
				<OrgCardContainer
					centered
					cols={ 2 }
					sx={ { paddingBottom: "clamp(0rem, -58.1818rem + 90.9091vh, 10rem)" } }
				>
					{ shuffledOrgs }
				</OrgCardContainer>
			</Container>

			<FundsVoteContext.Consumer>{ ({ chits, saveChits, member }) => {
				let sum = 0
				forEach(chits, value => sum += value)
				const remaining = member.theme.chits - sum
				const buttonDisabled = remaining !== 0

				return (
					<>
						<h2>ROUND 1 VOTES LEFT: <NumberFormat>{ remaining }</NumberFormat></h2>

						<FinalizeButton
							size="huge"
							disabled={ buttonDisabled }
							onClick={ () => {
								saveChits(props.source)
								setVotingComplete(true)
							} }
						>
							Finalize Vote
						</FinalizeButton>
					</>
				)
			} }</FundsVoteContext.Consumer>
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

const FinalizeButton = styled(Button)(({ theme }) => ({
	width: "100%",
	textAlign: "center",
	color: "white",
	border: "2px solid #fff",
	fontSize: "2rem",
	textTransform: "uppercase",
	backgroundColor: COLORS.blue,

	"&.Mui-disabled": {
		backgroundColor: COLORS.blue,
	},
}))

const NumberFormat = styled.span`
	display: inline-block;
`

ChitVotingKiosk.propTypes = {
	user: PropTypes.object,
	source: PropTypes.string,
}

export default ChitVotingKiosk

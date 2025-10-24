import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import numeral from "numeral"

import { observer } from "mobx-react-lite"
import { useData, useSettings, useOrgs } from "/imports/api/providers"
import { FundsVoteContext } from "/imports/ui/Kiosk/VotingContext"
import { forEach } from "lodash"
import { Container, Button, Typography } from "@mui/material"
import styled from "@emotion/styled"

import VotingComplete from "../VotingComplete"
import { OrgCard, OrgCardContainer } from "/imports/ui/Components/Cards"
import FundsSlider from "./FundsSlider"
import Countdown from "../Countdown"

import { COLORS } from "/imports/lib/global"

const AmountRemaining = React.memo(({ value }) => {
	return (
		<h2>
			FUNDS LEFT TO ALLOCATE: <NumberFormat>{ numeral(value).format("$0,0") }</NumberFormat>
		</h2>
	)
})

// TODO: Elements are too wide for screen at xl screen width
AmountRemaining.displayName = "AmountRemaining" // To slience eslint

const FundsVotingKiosk = observer(props => {
	const data = useData()
	const { settings } = useSettings()
	const { topOrgs } = useOrgs()

	const voted = props.user.theme.allocations.some(org => org.amount > 0)

	const [ votingComplete, setVotingComplete ] = useState(voted)
	const [ countdownVisible, setCountdownVisible ] = useState(false)
	const [ isCounting, setIsCounting ] = useState(false)

	const displayCountDown = () => {
		setCountdownVisible(true)
		setIsCounting(true)
	}

	useEffect(() => {
		// Display countdown if user is on voting screen when voting becomes disabled
		if(!settings.fundsVotingActive) displayCountDown()
	}, [settings.fundsVotingActive])

	const memberName = props.user.firstName ? props.user.firstName : props.user.fullName

	if(votingComplete) {
		return <VotingComplete setVotingComplete={ setVotingComplete } />
	}
	return (
		<OrgsContainer>
			<Typography variant="h4" component="h1" align="center">{ props.user.firstName && "Voting for" } { memberName }</Typography>

			{ countdownVisible && <Countdown seconds={ data.votingRedirectTimeout } isCounting={ isCounting } /> }

			<OrgCardContainer cols={ 2 }>
				{ topOrgs.map(org => {
					return (
						<OrgCard
							key={ org._id }
							org={ org }
							showAsk={ false }
							size="small"
							info={ true }
							content={ () => <FundsSlider org={ org } /> }
						/>
					)
				}) }
			</OrgCardContainer>

			<FundsVoteContext.Consumer>
				{ ({ allocations, saveAllocations, member }) => {
					let sum = 0
					forEach(allocations, value => sum += value)
					const remaining = member.theme.amount - sum
					const buttonDisabled = remaining !== 0

					return (
						<>
							<AmountRemaining value={ remaining } />
							<FinalizeButton
								size="huge"
								disabled={ buttonDisabled }
								onClick={ () => {
									saveAllocations(props.source)
									setVotingComplete(true)
								} }>Finalize Vote</FinalizeButton>
						</>
					)
				} }
			</FundsVoteContext.Consumer>
		</OrgsContainer>
	)
})

const OrgsContainer = styled(Container)`
	padding-top: 16px;
	padding-bottom: 16px;
	text-align: center;

	&& p {
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
	width: 12rem;
	display: inline-block;
`

FundsVotingKiosk.propTypes = {
	user: PropTypes.object,
	source: PropTypes.string,
}

AmountRemaining.propTypes = {
	value: PropTypes.number,
}

export default FundsVotingKiosk

import styled from "@emotion/styled"
import { Container, Button, Typography } from "@mui/material"
import { forEach } from "lodash"
import { observer } from "mobx-react-lite"
import numeral from "numeral"
import React, { useState, useEffect } from "react"

import { useData, useSettings, useOrgs } from "/imports/api/providers"
import VotingComplete from "../VotingComplete"
import { FundsVoteContext } from "../VotingContext"
import { OrgCard, OrgCardContainer } from "/imports/ui/components/Cards"
import FundsSlider from "./FundsSlider"
import Countdown from "../Countdown"

import { COLORS } from "/imports/lib/global"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"

interface AmountRemainingProps {
	value: number
}

const AmountRemaining = React.memo(({ value }: AmountRemainingProps) => {
	return (
		<h2>
			FUNDS LEFT TO ALLOCATE: <NumberFormat>{ numeral(value).format("$0,0") }</NumberFormat>
		</h2>
	)
})

// TODO: Elements are too wide for screen at xl screen width
AmountRemaining.displayName = "AmountRemaining" // To slience eslint

interface FundsVotingKioskProps {
	user: MemberWithTheme
	source: string
}

const FundsVotingKiosk = observer((props: FundsVotingKioskProps) => {
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

export default FundsVotingKiosk

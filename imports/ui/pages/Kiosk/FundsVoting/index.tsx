import styled from "@emotion/styled"
import { Container, Button, Typography } from "@mui/material"
import { forEach } from "lodash"
import { observer } from "mobx-react-lite"
import numeral from "numeral"
import React, { useState, useEffect } from "react"

import { useData, useSettings, useOrgs } from "/imports/api/providers"
import VotingComplete from "../VotingComplete"
import { useVoting } from "../VotingContext"
import { OrgCard, OrgCardContainer } from "/imports/ui/components/Cards"
import VotingCardContent from "./VotingCardContent"
import Countdown from "../Countdown"

import { COLORS } from "/imports/lib/global"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"
import { VotingSource } from "/imports/api/methods/MemberMethods"

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

interface FundsVotingKioskProps {
	user: MemberWithTheme
	source: VotingSource
}

const FundsVotingKiosk = observer(({ user, source }: FundsVotingKioskProps) => {
	const data = useData()
	const { settings } = useSettings()
	const { topOrgs } = useOrgs()
	const { allocations, saveAllocations, member } = useVoting()

	const voted = user.theme?.allocations?.some(org => (org.amount || 0) > 0) || false

	const [ votingComplete, setVotingComplete ] = useState(voted)
	const [ countdownVisible, setCountdownVisible ] = useState(false)
	const [ isCounting, setIsCounting ] = useState(false)

	const displayCountDown = () => {
		setCountdownVisible(true)
		setIsCounting(true)
	}

	useEffect(() => {
		// Display countdown if user is on voting screen when voting becomes disabled
		if(settings && !settings.fundsVotingActive) displayCountDown()
	}, [settings?.fundsVotingActive])

	const memberName = user.firstName ? user.firstName : user.fullName

	let allocationsSum = 0
	forEach(allocations, value => allocationsSum += value)
	const remaining = (member.theme?.amount || 0) - allocationsSum
	const buttonDisabled = remaining !== 0

	if(votingComplete) {
		return <VotingComplete setVotingComplete={ setVotingComplete } />
	}
	return (
		<OrgsContainer>
			<Typography variant="h4" component="h1" align="center">{ user.firstName && "Voting for" } { memberName }</Typography>

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
							content={ () => <VotingCardContent org={ org } /> }
						/>
					)
				}) }
			</OrgCardContainer>

			<>
				<AmountRemaining value={ remaining } />
				<FinalizeButton
					disabled={ buttonDisabled }
					onClick={ () => {
						saveAllocations(source)
						setVotingComplete(true)
					} }>Finalize Vote</FinalizeButton>
			</>
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
	width: 12rem;
	display: inline-block;
`

export default FundsVotingKiosk

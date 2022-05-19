import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { forEach, shuffle } from 'lodash'
import { observer } from 'mobx-react-lite'
import { useData, useSettings, useOrgs } from '/imports/api/providers'
import { FundsVoteContext } from '/imports/ui/Kiosk/VotingContext'
import { Container, Button, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { OrgCard, OrgCardContainer } from '/imports/ui/Components/Cards'
import VotingComplete from '../VotingComplete'
import ChitTicker from './ChitTicker'
import Countown from '../Countdown'

import { COLORS } from '/imports/lib/global'

const VotesRemaining = React.memo(({ value }) => {
	return (
		<h2>ROUND 1 VOTES LEFT: <NumberFormat>{ value }</NumberFormat></h2>
	)
})

const ShuffledOrgs = React.memo(({ orgs }) => <>{
	shuffle(orgs.values).map(org => (
		<OrgCard
			key={ org._id }
			org={ org }
			showAsk={ false }
			size='small'
			info={ true }
			content={ () => (
				<ChitTicker
					org={ org }
				/>
			) }
		/>
	))
}</>, (prev, next) => prev.orgs.values.every((org, i) => next.orgs.values[i]._id === org._id))


VotesRemaining.displayName = 'VotesRemaining' // To slience eslint

const FundsVotingKiosk = observer(props => {
	const data = useData()
	const { settings } = useSettings()
	const { orgs } = useOrgs()

	const voted = props.user.theme.chitVotes.some(org => org.votes > 0)

	const [ votingComplete, setVotingComplete ] = useState(voted)
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

	if(votingComplete) {
		return <VotingComplete setVotingComplete={ setVotingComplete } />
	}
	return (
		<OrgsContainer>

			<Typography variant="h2" component="h1">{props.user.firstName && 'Voting for'} {memberName}</Typography>

			{ countdownVisible && <Countown seconds={ data.votingRedirectTimeout } isCounting={ isCounting } /> }

			<Container maxWidth="xl" sx={ { height: '100%' } }>
				<OrgCardContainer centered cols={ 2 } sx={ { paddingBottom: 'clamp(0rem, -58.1818rem + 90.9091vh, 10rem)' } }>
					<ShuffledOrgs orgs={ orgs } />
				</OrgCardContainer>
			</Container>

			<FundsVoteContext.Consumer>{ ({ chits, saveChits, member }) => {
				let sum = 0
				forEach(chits, value => sum += value)
				const remaining = member.theme.chits - sum
				const buttonDisabled = remaining !== 0

				return(
					<>
						<VotesRemaining value={ remaining } />
						<FinalizeButton
							size='huge'
							disabled={ buttonDisabled }
							onClick={ () => {
								saveChits(props.source)
								setVotingComplete(true)
							} }>Finalize Vote</FinalizeButton>
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

const FinalizeButton = styled(Button)`
	width: 100%;
	text-align: center;
	background-color: ${COLORS.blue} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
	margin-bottom: 10px;
`

const NumberFormat = styled.span`
	display: inline-block;
`

FundsVotingKiosk.propTypes = {
	user: PropTypes.object,
	source: PropTypes.string
}

VotesRemaining.propTypes = {
	value: PropTypes.number
}

ShuffledOrgs.propTypes = {
	orgs: PropTypes.object
}

export default FundsVotingKiosk

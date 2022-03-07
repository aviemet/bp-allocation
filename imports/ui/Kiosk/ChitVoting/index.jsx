import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { forEach, shuffle } from 'lodash'

import { observer } from 'mobx-react-lite'
import { useData, useSettings, useOrgs } from '/imports/api/providers'
import { FundsVoteContext } from '/imports/ui/Kiosk/VotingContext'

import { Container } from '@mui/material'
import { Card, Header, Button } from 'semantic-ui-react'
import styled from '@emotion/styled'

import VotingComplete from '../VotingComplete'
import OrgCard from '/imports/ui/Components/Cards/OrgCard'
import ChitTicker from './ChitTicker'
import Countown from '../Countdown'

import { COLORS } from '/imports/lib/global'

const VotesRemaining = React.memo(({ value }) => {
	return (
		<Header as='h1' className="title">
			ROUND 1 VOTES LEFT: <NumberFormat>{ value }</NumberFormat>
		</Header>
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

	const randomizedOrgs = useMemo(() => shuffle(orgs.values), [orgs.values])

	if(votingComplete) {
		return <VotingComplete setVotingComplete={ setVotingComplete } />
	}
	return (
		<OrgsContainer>

			<Header as='h1' className="title">{props.user.firstName && 'Voting for'} {memberName}</Header>

			{ countdownVisible && <Countown seconds={ data.votingRedirectTimeout } isCounting={ isCounting } /> }

			<Card.Group doubling centered itemsPerRow={ 2 }>
				{/* { shuffle(orgs.values).map(org => {
					return (
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
					)
				} ) } */}
				<ShuffledOrgs orgs={ orgs } />
			</Card.Group>

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

const OrgsContainer = styled(Container)`
	padding: 20px;

	&& .ui.centered.two.cards {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	&& .ui.card {
		margin: 0.3rem;

		.content{
			padding: 0.2em 0.5em 1.5em;
		}
	}

	&& h1.ui.header.title {
		color: #FFF;
		text-align: center;
		font-size: 3rem;
		text-transform: uppercase;
	}

	&& h3.ui.header {
		font-size: 1.5rem;
		color: #FFF;
		text-align: center;
	}

	&& p {
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
	width: 12rem;
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

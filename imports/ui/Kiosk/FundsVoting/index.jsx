import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import numeral from 'numeral'

import { observer } from 'mobx-react-lite'
import { useData, useSettings, useOrgs } from '/imports/api/providers'
import { FundsVoteContext } from '/imports/ui/Kiosk/VotingContext'

import { Card, Container, Header, Button } from 'semantic-ui-react'
import styled from 'styled-components'

import VotingComplete from '../VotingComplete'
import OrgCard from '/imports/ui/Components/Cards/OrgCard'
import FundsSlider from './FundsSlider'
import useInterval from '/imports/ui/Components/useInterval'

import { COLORS } from '/imports/lib/global'

const AmountRemaining = React.memo(({ value }) => {
	return (
		<Header as='h1' className="title">
			FUNDS LEFT TO ALLOCATE: <NumberFormat>{numeral(value).format('$0,0')}</NumberFormat>
		</Header>
	)
})

AmountRemaining.displayName = 'AmountRemaining' // To slience eslint

const FundsVotingKiosk = observer(props => {
	const data = useData()
	const { settings } = useSettings()
	const { topOrgs } = useOrgs()

	const voted = props.user.theme.allocations.some(org => org.amount > 0)
	console.log({ user: props.user })

	const [ votingComplete, setVotingComplete ] = useState(voted)
	const [ countdownVisible, setCountdownVisible ] = useState(false)
	const [ count, setCount ] = useState(data.votingRedirectTimeout)
	const [ isCounting, setIsCounting ] = useState(false)
	
	useInterval(() => {
		setCount(count - 1)
	}, isCounting ? 1000 : null)

	const displayCountDown = () => {
		setCountdownVisible(true)
		setCount(data.votingRedirectTimeout)
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

			<Header as='h1' className="title">{props.user.firstName && 'Voting for'} {memberName}</Header>

			{ countdownVisible && <Header as='h3' className='countdown'>
				Voting has ended, please submit your votes. <br/>
				This page will redirect in { count } seconds
			</Header> }

			<Card.Group doubling centered itemsPerRow={ 2 }>
				{topOrgs.map(org => {
					return(
						<OrgCard
							key={ org._id }
							org={ org }
							showAsk={ false }
							size='small'
							info={ true }
							content={ () => (
								<FundsSlider
									org={ org }
								/>
							) }
						/>)
				})}
			</Card.Group>

			<FundsVoteContext.Consumer>{({ allocations, saveAllocations, member }) => {
				let sum = 0
				_.forEach(allocations, value => sum += value)
				const remaining = member.theme.amount - sum
				const buttonDisabled = remaining !== 0
				
				return(
					<>
						<AmountRemaining value={ remaining } />
						<FinalizeButton
							size='huge'
							disabled={ buttonDisabled }
							onClick={ () => {
								saveAllocations(props.source)
								setVotingComplete(true)
							} }>Finalize Vote</FinalizeButton>
					</>
				)
			}}</FundsVoteContext.Consumer>
		</OrgsContainer>
	)
})

const OrgsContainer = styled(Container)`
	padding-top: 20px;

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
`

const NumberFormat = styled.span`
	width: 12rem;
	display: inline-block;
`

FundsVotingKiosk.propTypes = {
	user: PropTypes.object,
	source: PropTypes.string
}

AmountRemaining.propTypes = {
	value: PropTypes.number
}

export default FundsVotingKiosk

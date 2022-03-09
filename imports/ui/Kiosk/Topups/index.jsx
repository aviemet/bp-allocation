import React, { useState, useEffect } from 'react'
import { useOrgs } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'

import { roundFloat } from '/imports/lib/utils'

import { Container, Form, Input, Button, Card, Checkbox, Loader } from 'semantic-ui-react'
import styled from '@emotion/styled'

import OrgCard from '/imports/ui/Components/Cards/OrgCard'
import TopupComplete from './TopupComplete'
import { observer } from 'mobx-react-lite'
import { useWindowSize, breakpoints } from '/imports/ui/MediaProvider'

const Pledges = observer(({ user }) => {
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	const [ selectedOrg, setSelectedOrg ] = useState(null)
	const [ pledgeAmount, setPledgeAmount ] = useState('')
	const [ isFormValid, setIsFormValid ] = useState(false)
	const [ isAnonymous, setIsAnonymous ] = useState(false)
	const [ itemsPerRow, setItemsPerRow ] = useState(2)
	const [ didPledge, setDidPlegde ] = useState(false)

	const { width } = useWindowSize()

	useEffect(() => {
		let n = itemsPerRow
		if(width < breakpoints.tablet) n = 1
		else if(width >= breakpoints.tablet && width < breakpoints.tabletL) n = 2
		else n = 3

		if(itemsPerRow !== n) setItemsPerRow(n)
	}, [width])

	const clearAllValues = () => {
		setSelectedOrg(null)
		setPledgeAmount('')
		setDidPlegde(false)
	}

	useEffect(() => {
		const isValid = selectedOrg !== null && pledgeAmount !== ''
		if(isFormValid !== isValid) setIsFormValid(isValid)
	}, [selectedOrg, pledgeAmount])

	const saveTopUp = () => {
		const data = {
			id: selectedOrg,
			member: user._id,
			amount: roundFloat(pledgeAmount),
			anonymous: isAnonymous
		}
		OrganizationMethods.pledge.call(data)
		setDidPlegde(true)
	}

	const setAmount = e => {
		const amount = e.target.value
		console.log({ amount })
		setPledgeAmount(parseInt(`${amount}`.replace(/([^0-9])/)))
	}

	if(orgsLoading) return <Loader active />
	if(didPledge) {
		const votedOrg = topOrgs.find(org => org._id === selectedOrg)
		return <TopupComplete clearAllValues={ clearAllValues } org={ votedOrg } amount={ roundFloat(pledgeAmount) } />
	}
	return (
		<PledgesContainer fluid textAlign='center'>
			<h1>If you feel like giving more</h1>
			<p>Pledges made during this round will be matched from the leverage remaining. If you feel strongly about an organization and want to help them achieve full funding, now is your chance!</p>

			{/* Member name and amount input fields */}
			<Form	inverted>
				<Container>
					<div  style={ { textAlign: 'right', marginBottom: '0.5rem' } }>
						<Checkbox
							toggle
							label='Anonymous'
							checked={ isAnonymous }
							onClick={ () => setIsAnonymous(!isAnonymous) }
						/>
					</div>
					<Input fluid
						icon='dollar'
						iconPosition='left'
						placeholder='Pledge Amount'
						type='text'
						value={ pledgeAmount || '' }
						onChange={ setAmount }
						onKeyUp={ setAmount }
						size='huge'
						pattern="[0-9]*"
					/>
				</Container>
			</Form>

			{/* Selectable Cards for top orgs */}
			<Card.Group
				centered
				itemsPerRow={ itemsPerRow }
			>
				{ topOrgs.map(org => (
					<OrgCard
						disabled={ org.need <= 0 }
						key={ org._id }
						org={ org }
						showAsk={ false }
						onClick={ org.need > 0 ? () => setSelectedOrg(org._id) : null }
						bgcolor={ selectedOrg === org._id ? OrgCard.colors.GREEN : OrgCard.colors.BLUE }
					/>
				) ) }
			</Card.Group>

			<Container>
				<FinalizeButton
					size='huge'
					disabled={ !isFormValid }
					onClick={ saveTopUp }
				>Submit Matched Pledge</FinalizeButton>
			</Container>

		</PledgesContainer>
	)
})

const PledgesContainer = styled(Container)`
	height: 100vh;
	padding-top: 3rem;

	h1 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 3rem;
	}

	form {
		margin-bottom: 2rem;
	}

	.ui {
		&.cards {
			margin-bottom: 3rem;
		}

		&.toggle.checkbox {
			input:checked ~ .box, input:checked ~ label {
				color: #FFF !important;
			}
		}
	}
`

const FinalizeButton = styled(Button)`
	width: 100%;
	text-align: center;
	background-color: ${OrgCard.colors.GREEN} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
`

export default Pledges
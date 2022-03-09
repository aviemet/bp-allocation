import React, { useState, useEffect } from 'react'
import { useOrgs, useMembers } from '/imports/api/providers'
import { OrganizationMethods } from '/imports/api/methods'

import { isEmpty } from 'lodash'
import { toJS } from 'mobx'
import { roundFloat } from '/imports/lib/utils'

import { Container, Form, Input, Button, Card, Checkbox, Loader } from 'semantic-ui-react'
import styled from '@emotion/styled'
import { useWindowSize, breakpoints } from '/imports/ui/MediaProvider'

import OrgCard from '/imports/ui/Components/Cards/OrgCard'
import MemberSearch from '/imports/ui/Components/MemberSearch'
import { observer } from 'mobx-react-lite'

const Pledges = observer(() => {
	const { members, isLoading: membersLoading } = useMembers()
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	const [ selectedOrg, setSelectedOrg ] = useState(null)
	const [ memberInputValue, setMemberInputValue ] = useState('')
	const [ selectedMember, setSelectedMember ] = useState(null)
	const [ pledgeAmount, setPledgeAmount ] = useState('')
	const [ isFormValid, setIsFormValid ] = useState(false)
	const [ isAnonymous, setIsAnonymous ] = useState(false)

	const { width } = useWindowSize()

	useEffect(() => {
		const isValid = selectedOrg !== null && selectedMember !== null && pledgeAmount !== ''
		if(isFormValid !== isValid) setIsFormValid(isValid)
	}, [selectedOrg, selectedMember, pledgeAmount])

	const clearAllValues = () => {
		setSelectedOrg(null)
		setMemberInputValue('')
		setSelectedMember(null)
		setPledgeAmount('')
		setIsAnonymous(false)
	}

	const saveTopUp = () => {
		OrganizationMethods.pledge.call({
			id: selectedOrg,
			member: selectedMember,
			amount: roundFloat(pledgeAmount),
			anonymous: isAnonymous
		})
		clearAllValues()
	}

	const setAmount = e => {
		const amount = e.target.value
		setPledgeAmount(parseInt(`${amount}`.replace(/([^0-9])/)))
	}

	if(membersLoading || isEmpty(members) || orgsLoading) return <Loader active />
	return (
		<PledgesContainer fluid textAlign='center'>
			<h1>Top-ups</h1>
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
					<Form.Group>
						<Form.Field width={ 10 }>
							<MemberSearch fluid
								data={ toJS(members.values) }
								value={ memberInputValue }
								setValue={ setMemberInputValue }
								onResultSelect={ result => setSelectedMember(result.id) }
								size='huge'
							/>
						</Form.Field>
						<Form.Field width={ 6 }>
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
						</Form.Field>
					</Form.Group>
				</Container>
			</Form>

			{/* Selectable Cards for top orgs */}
			<Card.Group centered itemsPerRow={ width < breakpoints.tablet ? 1 : 2 }>
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

			<BottomRight>
				<Button
					onClick={ clearAllValues }
					content='Clear'
					icon='cancel'
					labelPosition='right'
				/>
			</BottomRight>

		</PledgesContainer>
	)
})

const PledgesContainer = styled(Container)`
	padding-top: 2rem;
	padding-bottom: 1rem;

	h1 {
		text-align: center;
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}

	form {
		margin-bottom: 1rem;
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

const BottomRight = styled.div`
	padding-top: 1rem;
	text-align: right;
	align-items: flex-end;
	display: flex;
	justify-content: flex-end;
`

export default Pledges

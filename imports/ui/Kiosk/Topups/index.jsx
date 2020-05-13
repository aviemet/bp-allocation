import React, { useState, useEffect } from 'react';
import { useOrgs, useMembers } from '/imports/api/providers';
import { OrganizationMethods } from '/imports/api/methods';

import { isEmpty } from 'lodash';
import { toJS } from 'mobx';
import { roundFloat } from '/imports/lib/utils';

import { Container, Form, Input, Button, Card, Checkbox, Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import OrgCard from '/imports/ui/Components/OrgCard';
import { observer } from 'mobx-react-lite';

const Pledges = observer(props => {
	const { members, isLoading: membersLoading } = useMembers();
	const { topOrgs, isLoading: orgsLoading } = useOrgs();

	const [ selectedOrg, setSelectedOrg ] = useState(null);
	const [ pledgeAmount, setPledgeAmount ] = useState('');
	const [ isFormValid, setIsFormValid ] = useState(false);
	const [ isAnonymous, setIsAnonymous ] = useState(false);

	useEffect(() => {
		const isValid = selectedOrg !== null && pledgeAmount !== '';
		if(isFormValid !== isValid) setIsFormValid(isValid);
	}, [selectedOrg, pledgeAmount]);

	const clearAllValues = () => {
		setSelectedOrg(null);
		setPledgeAmount('');
	};

	const saveTopUp = () => {
		const data = {
			id: selectedOrg,
			member: props.user._id,
			amount: roundFloat(pledgeAmount),
			anonymous: isAnonymous
		};
		OrganizationMethods.pledge.call(data);
		clearAllValues();
	};

	if(membersLoading || isEmpty(members) || orgsLoading) return <Loader active />;
	return (
		<PledgesContainer fluid textAlign='center'>
			<h1>If you feel like giving more</h1>
			<p>Pledges made during this round will be matched from the leverage remaining. If you feel strongly about an organization and want to help them achieve full funding, now is your chance.</p>

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
						type='number'
						value={ pledgeAmount || '' }
						onChange={ e => setPledgeAmount(e.target.value) }
						onKeyUp={ e => setPledgeAmount(e.target.value) }
						size='huge'
					/>
				</Container>
			</Form>

			{/* Selectable Cards for top orgs */}
			<Card.Group centered itemsPerRow={ 2 }>
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
	);
});

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
`;

const FinalizeButton = styled(Button)`
	width: 100%;
	text-align: center;
	background-color: ${OrgCard.colors.GREEN} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
`;

const BottomRight = styled.div`
	text-align: right;
	align-items: flex-end;
	display: flex;
	justify-content: flex-end;
	height: 150px;
`;

export default Pledges;
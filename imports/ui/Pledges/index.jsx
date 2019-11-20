import React, { useState, useEffect } from 'react';
import { useData } from '/imports/stores/DataProvider';
import { OrganizationMethods } from '/imports/api/methods';

import { toJS } from 'mobx';
import { roundFloat } from '/imports/lib/utils';

import { Container, Form, Input, Button, Card } from 'semantic-ui-react';
import styled from 'styled-components';

import OrgCard from '/imports/ui/Components/OrgCard';
import MemberSearch from '/imports/ui/Components/MemberSearch';

const Pledges = () => {
	const { orgs, members } = useData();

	const [ selectedOrg, setSelectedOrg ] = useState(null);
	const [ memberInputValue, setMemberInputValue ] = useState('');
	const [ selectedMember, setSelectedMember ] = useState(null);
	const [ pledgeAmount, setPledgeAmount ] = useState('');
	const [ isFormValid, setIsFormValid ] = useState(false);

	// console.log({ org: selectedOrg, member: selectedMember });

	useEffect(() => {
		const isValid = selectedOrg !== null && selectedMember !== null && pledgeAmount !== '';
		if(isFormValid !== isValid) setIsFormValid(isValid);
	}, [selectedOrg, selectedMember, pledgeAmount]);

	const clearAllValues = () => {
		setSelectedOrg(null);
		setMemberInputValue('');
		setSelectedMember(null);
		setPledgeAmount('');
	};

	const saveTopUp = () => {
		console.log({ selectedOrg, selectedMember, pledgeAmount, isFormValid });
		OrganizationMethods.pledge.call({
			id: selectedOrg,
			member: selectedMember,
			amount: roundFloat(pledgeAmount),
		});
		clearAllValues();
	};

	console.log({ members: [ ...toJS(members.values), { fullName: 'Anonymous', _id: '00' } ] });

	return (
		<PledgesContainer fluid textAlign='center'>
			<h1>Top-ups</h1>
			{/* Member name and amount input fields */}
			<Form>
				<Container>
					<Form.Group>
						<Form.Field width={ 10 }>
							<MemberSearch fluid
								data={ [ ...toJS(members.values), { fullName: 'Anonymous', _id: '00' } ] }
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
								type='number'
								value={ pledgeAmount || '' }
								onChange={ e => setPledgeAmount(e.target.value) }
								onKeyUp={ e => setPledgeAmount(e.target.value) }
								size='huge'
							/>
						</Form.Field>
					</Form.Group>
				</Container>
			</Form>

			{/* Selectable Cards for top orgs */}
			<Card.Group centered itemsPerRow={ 2 }>
				{ orgs.topOrgs.map(org => (
					<OrgCard
						key={ org._id }
						org={ org }
						showAsk={ false }
						onClick={ () => setSelectedOrg(org._id) }
						bgcolor={ selectedOrg === org._id ? OrgCard.colors.GREEN : OrgCard.colors.BLUE }
					/>
				) ) }
			</Card.Group>

			<Container>
				<FinalizeButton
					size='huge'
					disabled={ !isFormValid }
					onClick={ saveTopUp }
				>Finalize Vote</FinalizeButton>
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
	);
};

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

	.ui.cards {
		margin-bottom: 3rem;
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
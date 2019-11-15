import React, { useState } from 'react';
import { useData } from '/imports/stores/DataProvider';
import { Container, Form, Input, Button } from 'semantic-ui-react';
import MemberSearch from '/imports/ui/Components/MemberSearch';
import { toJS } from 'mobx';
import styled from 'styled-components';

const Pledges = () => {
	const { orgs, members } = useData();

	const [ selectedOrg, setSelectedOrg ] = useState(null);

	const handleFormFocus = org => {
		if(selectedOrg !== org) setSelectedOrg(org);
	};

	const onResultSelect = result => {
		// console.log({ result });
	};

	// console.log({ selectedOrg });

	return (
		<PledgesContainer fluid textAlign='center' className={ selectedOrg !== null ? 'focused' : null }>
			<h1>Topups</h1>
			{ orgs.topOrgs.map(org => (
				<Form 
					onFocus={ () => handleFormFocus(org._id) } 
					key={ org._id }
					className={ (selectedOrg !== null && selectedOrg !== org._id) ? 'disabled' : null }
				>
					<h2>{ org.title }</h2>
					<Container>
						<Form.Group>
							<Form.Field width={ 9 }>
								<MemberSearch 
									data={ toJS(members.values) }
									onResultSelect={ onResultSelect }
									fluid
								/>
							</Form.Field>
							<Form.Field width={ 7 }>
								<Input placeholder='Pledge $' fluid action>
									<input />
									<Button 
										disabled={ selectedOrg === null || selectedOrg !== org._id }
										color={ (selectedOrg !== null && selectedOrg !== org._id) ? null : 'green' }
									>Pledge!</Button>
								</Input>
							</Form.Field>
						</Form.Group>
					</Container>
				</Form>
			) ) }
		</PledgesContainer>
	);
};

const PledgesContainer = styled.div`
	margin-top: 15px;

	h1 {
		text-align: center;
		font-size: 2.5rem;
	}

	& .ui.form.disabled {
		color: #777;

		.ui.input input {
			background: #777;
		}
	}

	& form {
		padding: 10px;
		margin: 10px 0;
		border-radius: 10px;
	}

	&.focused form:not(.disabled) {
		background: rgba(255,255,255,0.1);
	}
`;

export default Pledges;
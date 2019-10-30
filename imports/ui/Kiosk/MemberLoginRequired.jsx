import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import styled from 'styled-components';
import { Container, Form, Input, Header, Button } from 'semantic-ui-react';

import { VotingContextProvider } from './VotingContext';

import { COLORS } from '/imports/lib/global';

const MemberLoginContainer = styled(Container)`
	text-align: center;
	padding-top: 6rem;

	h1.title {
		color: #FFF;
		text-align: center;
		font-size: 3rem;
		text-transform: uppercase;
	}

	& h2.ui.header {
		color: #FFF;
	}

	.ui.search .ui.icon.input {
		width: 100%;
	}
`;

const Centered = styled.div`
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	z-index: 1000;
`;
const BackgroundImage = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100vh;
	opacity: 0.1;
	z-index: 1;
	background: url('/img/BPLogo.svg') no-repeat 50% 50%;
	background-size: 1600px;
`;

const SubmitButton = styled(Button)`
	width: 100%;
	text-align: center;
	background-color: ${COLORS.blue} !important;
	color: white !important;
	border: 2px solid #fff !important;
	font-size: 2rem !important;
	text-transform: uppercase !important;
`;

const MemberLoginRequired = observer(props => {
	// Pull member data from Data Store
	const data = useData();
	const members = data.members.values;

	const formRef = React.createRef();

	const [ initials, setInitials ] = useState('');
	const [ number, setNumber ] = useState('');

	const [ searchError, setSearchError ] = useState(false);
	
	const member = _.find(members, member => member._id === props.member);
	const [ user, setUser ] = useState(member || false);

	const showSearchError = () => {
		setSearchError(true);
		setTimeout(() => {
			setSearchError(false);
		}, 5000);
	};

	const chooseMember = e => {
		e.preventDefault();

		setSearchError(false);
		const code = `${initials.trim().toUpperCase()}${number}`;
		
		const member = _.find(members, ['code', code]);
		
		setInitials('');
		setNumber('');
		if(member) {
			setUser(member);
		} else {
			showSearchError();
		}
	};

	const ChildComponent = props.component;
	const submitDisabled = initials === '' || number === '';

	// props.member comes from router params
	// Display the interface to choose a member
	if(!user) {
		return(
			<MemberLoginContainer>
				<BackgroundImage />
				<Centered>
					<Header as='h1' className='title'>Enter Your Initials & Member ID</Header>
					<Container>
						<Form onSubmit={ chooseMember } ref={ formRef }>
							<Form.Group inline widths='equal'>
								<Form.Field>
									<Input
										fluid
										size='huge'
										label='Initials'
										placeholder='Ex: MB'
										value={ initials }
										onChange={ e => setInitials(e.target.value.trim().toUpperCase()) }
									/>
								</Form.Field>
								<Form.Field>
									<Input
										fluid
										size='huge'
										label='Member #'
										placeholder='Ex: 1234'
										value={ number }
										onChange={ e => setNumber(parseInt(e.target.value.trim()) || '') }
									/>
								</Form.Field>
							</Form.Group>
							<Form.Group>
								<SubmitButton size='huge' disabled={ submitDisabled } onClick={ formRef.submit }>Begin Voting!</SubmitButton>
							</Form.Group>
						</Form>
					</Container>

					{ searchError && <Header as='h2' className='title'>No Member Found, Try Again</Header> }

				</Centered>
			</MemberLoginContainer>
		);
	}

	// Member is chosen, display the voting panel
	return (
		<VotingContextProvider member={ user } unsetUser={ () => setUser(false) }>
			<ChildComponent user={ user } />
		</VotingContextProvider>
	);
});

MemberLoginRequired.propTypes = {
	component: PropTypes.any
};

export default MemberLoginRequired;

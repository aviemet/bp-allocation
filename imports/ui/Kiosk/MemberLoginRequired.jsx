import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { useMembers } from '/imports/context';
import { Members } from '/imports/api'

import styled from 'styled-components';
import { Container, Form, Input, Label, Header, Button } from 'semantic-ui-react';

import { VotingContextProvider } from './VotingContext';

import MemberSearch from '/imports/ui/Components/MemberSearch';

import { COLORS } from '/imports/global';

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
`
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
`

const MemberLoginRequired = props => {

	const formRef = React.createRef();

	// const [ searchInput, setSearchInput ] = useState('');
	const [ initials, setInitials ] = useState('');
	const [ number, setNumber ] = useState('');

	const [ searchError, setSearchError ] = useState(false);
	const [ user, setUser ] = useState(false);
	const [ confirmUser, setConfirmUser ] = useState(false);
	const [ renderCount, setRenderCount ] = useState(0);

	const { members, membersLoading } = useMembers();

	// Debugging purposes only
	/*if(!membersLoading && !user) {
		setUser(members[0]);
	}*/

	// Member chosen from search bar, record for confirmation
	/*const chooseMember = result => {
		setConfirmUser(_.find(members, ['_id', result.id]));
	}*/

	const showSearchError = () => {
		setSearchError(true);
		setTimeout(() => {
			setSearchError(false);
		}, 5000);
	}

	const chooseMember = e => {
		e.preventDefault();

		setSearchError(false);
		const code = `${initials.trim().toUpperCase()}${number}`;
		// const member = _.find(members, ['code', searchInput.trim().toUpperCase()]);
		const member = _.find(members, ['code', code]);
		// setSearchInput('');
		setInitials('');
		setNumber('');
		if(member) {
			setUser(member);
		} else {
			showSearchError();
		}
	}

	const SubmitButton = styled(Button)`
		width: 100%;
		text-align: center;
		background-color: ${COLORS.blue} !important;
		color: white !important;
		border: 2px solid #fff !important;
		font-size: 2rem !important;
		text-transform: uppercase !important;
	`
	/*const resetMember = () => {
		setConfirmUser(false);
		setSearchInput('');
	}*/

	/*const displayVoting = () => {
		setSearchInput('');
		setUser(confirmUser);
		setConfirmUser(false);
	}*/

	const ChildComponent = props.component;
	const submitDisabled = initials === '' || number === ''

	// Display the interface to choose a member
	if(!user) {
		return(
			<MemberLoginContainer>
				<BackgroundImage />
				<Centered>
				<Header as='h1' className='title'>Enter Your Initials & Member ID</Header>
					<Container>
						<Form onSubmit={chooseMember} ref={formRef}>
							{/*<Form.Input fluid
								value={searchInput}
								onChange={e => setSearchInput(e.target.value.trim().toUpperCase())}
								type="text"
								size="massive"
								icon="user"
								iconPosition="left"
								placeholder="Example: MB1234"
								action={<Button>Search</Button>}
							/>*/}
							<Form.Group inline>
								<Form.Field>
									<Input
										style={{width: '325px'}}
										size='huge'
										label='Initials'
										placeholder='Ex: MB'
										value={initials}
										onChange={e => setInitials(e.target.value.trim().toUpperCase())}
									/>
								</Form.Field>
								<Form.Field>
								<Input
									size='huge'
									label='Member #'
									placeholder='Ex: 1234'
									value={number}
									onChange={e => setNumber(parseInt(e.target.value.trim()) || '')}
								/>
								</Form.Field>
							</Form.Group>
							<Form.Group>
								<SubmitButton size='huge' disabled={submitDisabled} onClick={formRef.submit}>Begin Voting!</SubmitButton>
							</Form.Group>
						</Form>
					</Container>
					{/*<MemberSearch
						key={renderCount}
						data={members}
						callback={chooseMember}
						size='massive'
					/>*/}
				{/*confirmUser && <React.Fragment>

					<Header as='h2' className='title'>Hello {confirmUser.firstName ? confirmUser.firstName : confirmUser.fullName}, ready to vote?</Header>
					<Button size='massive' color='red' onClick={resetMember}>Oops, not me!</Button>
					<Button size='massive' color='green' onClick={displayVoting}>Let's vote!</Button>

				</React.Fragment>*/}

				{searchError && <Header as='h2' className='title'>No Member Found, Try Again</Header>}
				</Centered>
			</MemberLoginContainer>
		);
	}

	// Member is chosen, display the voting panel
	return (
		<VotingContextProvider member={user} unsetUser={() => setUser(false)}>
			<ChildComponent user={user} />
		</VotingContextProvider>
	);
}

export default MemberLoginRequired;

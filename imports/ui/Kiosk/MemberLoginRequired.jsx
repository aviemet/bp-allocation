import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { useMembers } from '/imports/context';
import { Members } from '/imports/api'

import styled from 'styled-components';
import { Container, Form, Input, Label, Header, Button } from 'semantic-ui-react';

import { VotingContextProvider } from './VotingContext';

import MemberSearch from '/imports/ui/Components/MemberSearch';

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

const MemberLoginRequired = props => {

	const [ searchInput, setSearchInput ] = useState('');
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

	const chooseMember = () => {
		setSearchError(false);
		const member = _.find(members, ['code', searchInput.trim().toUpperCase()]);
		setSearchInput('');
		if(member) {
			setUser(member);
		} else {
			showSearchError();
		}
	}

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

	// Display the interface to choose a member
	if(!user) {
		return(
			<MemberLoginContainer>
				<Header as='h1' className='title'>Enter Your Member ID</Header>
					<Container style={{width: "80%"}}>
						<Form onSubmit={chooseMember}>
							<Form.Input fluid
								value={searchInput}
								onChange={e => setSearchInput(e.target.value.trim().toUpperCase())}
								type="text"
								size="massive"
								icon="user"
								iconPosition="left"
								placeholder="Example: MB1234"
								action={<Button>Search</Button>}
							/>
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

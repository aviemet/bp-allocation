import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { useMembers } from '/imports/context';

import styled from 'styled-components';
import { Container, Input, Label, Header, Button } from 'semantic-ui-react';

import { VotingContextProvider } from './VotingContext';

import MemberSearch from '/imports/ui/Components/MemberSearch';

const MemberLoginContainer = styled(Container)`
	h1.title {
		color: #FFF;
		text-align: center;
		font-size: 3rem;
		text-transform: uppercase;
	}
`;

const MemberLoginRequired = props => {

	const [ user, setUser ] = useState(false);
	const [ confirmUser, setConfirmUser ] = useState(false);
	const [ renderCount, setRenderCount ] = useState(0);

	const { members, membersLoading } = useMembers();

	// Debuggin purposes only
	if(!membersLoading && !user) {
		setUser(members[0]);
	}

	// Member chosen from search bar, record for confirmation
	const chooseMember = result => {
		setConfirmUser(_.find(members, ['_id', result.id]));
	}

	// Increments key of search bar to force a re-render
	const resetMember = () => {
		setConfirmUser(false);
		setRenderCount(renderCount + 1);
	}

	const ChildComponent = props.component;

	// Display the interface to choose a member
	if(!user) {
		return(
			<MemberLoginContainer>
				<Header as='h1' className='title'>Please enter your name or member number</Header>
					<MemberSearch
						key={renderCount}
						data={members}
						callback={chooseMember}
					/>
				{confirmUser && <React.Fragment>

					<Header as='h2' className='title'>Hello {confirmUser.firstName}, ready to vote?</Header>
					<Button color='red' onClick={resetMember}>Oops, not me!</Button>
					<Button color='green' onClick={() => setUser(confirmUser)}>Yes, let's vote!</Button>

				</React.Fragment>}
			</MemberLoginContainer>
		);
	}

	// Member is chosen, display the voting panel
	return (
		<VotingContextProvider member={user}>
			<ChildComponent />
		</VotingContextProvider>
	);
}

export default MemberLoginRequired;

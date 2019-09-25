import React from 'react';

import { Container } from 'semantic-ui-react';

import NewMemberInputs from './NewMemberInputs';
import MembersList from './MembersList';
import ImportMembers from './ImportMembers';

const MembersPane = props => {
	return (
		<Container>
			<h1>
				Members
				<ImportMembers />
			</h1>
			<NewMemberInputs />
			<MembersList />
		</Container>
	);
};

export default MembersPane;

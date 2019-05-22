import React from 'react';
import _ from 'lodash';

import { Container } from 'semantic-ui-react';

import { useMembers } from '/imports/context';

import NewMemberInputs from './NewMemberInputs';
import MembersList from './MembersList';
import ImportMembers from './ImportMembers';

const MembersPane = props => {
	const { members, memberThemes } = useMembers();

	// console.log("STARTING");
	// memberThemes.map((memberTheme, i) => {
	// 	console.log(i);
	// 	console.log(_.find(members, ['_id', memberTheme.member]));
	// });

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

import React from 'react';
import { withRouter } from 'react-router-dom';
import { useData } from '/imports/stores/DataProvider';
import _ from 'lodash';

const UserVoting = withRouter(props => {
	const data = useData();
	const { theme } = data;
	const members = data.members.values;
	const member = _.find(members, member => member._id === props.match.params.member);

	if(!member) {
		return (
			<>
				<h1>Uh Oh!</h1>
				<p>Terribly sorry, but there appears to have been an error with the link you entered</p>
			</>
		);
	}

	return (
		<>
			<h1>User Voting</h1>
			<h2>Theme:</h2>
			<p>{ theme.title }</p>
			<h2>Member:</h2>
			<p>{ member.fullName }</p>
		</>
	);
});

export default UserVoting;

/*
member: h8cwSgWLT4HYCJEBB
theme: c6h3jgufCnGYjerzJ
*/
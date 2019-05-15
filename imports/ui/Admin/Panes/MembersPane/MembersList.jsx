import React from 'react';
import numeral from 'numeral';

import { useTheme, useMembers } from '/imports/context';
import { MemberMethods } from '/imports/api/methods';

import { Table, Icon, Button } from 'semantic-ui-react';

const MembersList = (props) => {

	const { theme } = useTheme();
	const { members } = useMembers();

	const removeMember = id => {
		MemberMethods.removeMemberFromTheme.call({memberId: id, themeId: theme._id});
	}

  return (
  	<Table size='small' striped>
  		<Table.Header>
  			<Table.Row>
  				<Table.HeaderCell><Icon name='hashtag' /></Table.HeaderCell>
  				<Table.HeaderCell>Member Name</Table.HeaderCell>
  				<Table.HeaderCell><Icon name='dollar' /></Table.HeaderCell>
  				<Table.HeaderCell></Table.HeaderCell>
  			</Table.Row>
  		</Table.Header>
  		<Table.Body>
		  	{members && members.map(member => (
		  		<Table.Row key={member._id}>
		  			<Table.Cell collapsing>{member.number ? member.number : ''}</Table.Cell>
		  			<Table.Cell>{`${member.firstName} ${member.lastName}`}</Table.Cell>
		  			<Table.Cell>{numeral(member.theme.amount || 0).format('$0,0.00')}</Table.Cell>
		  			<Table.Cell collapsing><Button icon='trash' onClick={() => removeMember(member._id)} /></Table.Cell>
		  		</Table.Row>
		  	))}
	  	</Table.Body>
  	</Table>
  );
}

export default MembersList;

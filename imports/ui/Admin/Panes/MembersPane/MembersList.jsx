import React from 'react';
import numeral from 'numeral';

import { useTheme, usePresentationSettings, useMembers } from '/imports/context';
import { MemberMethods } from '/imports/api/methods';

import { Table, Icon, Button } from 'semantic-ui-react';

const MembersList = (props) => {

	const { theme } = useTheme();
	const { settings } = usePresentationSettings();
	const { members } = useMembers();

	const removeMember = id => {
		MemberMethods.removeMemberFromTheme.call({memberId: id, themeId: theme._id});
	}

	let votingColspan = 0;
	if(settings.useKioskChitVoting) votingColspan++;
	if(settings.useKioskFundsVoting) votingColspan++;

	return (
		<Table size='small' striped celled structured>
			<Table.Header>
				<Table.Row>
					<Table.HeaderCell rowSpan="2"><Icon name='hashtag' /></Table.HeaderCell>
					<Table.HeaderCell rowSpan="2">Member Name</Table.HeaderCell>
					<Table.HeaderCell rowSpan="2">Funds</Table.HeaderCell>
					{votingColspan > 0 &&
						<Table.HeaderCell colSpan={votingColspan} collapsing textAlign="center">Voting</Table.HeaderCell>
					}
					{!props.hideAdminFields &&
						<Table.HeaderCell rowSpan="2"></Table.HeaderCell>
					}
				</Table.Row>
				{votingColspan > 0 &&
				<Table.Row>
					{settings.useKioskChitVoting && <Table.HeaderCell collapsing><Icon name='cog' /></Table.HeaderCell>}
					{settings.useKioskFundsVoting &&<Table.HeaderCell collapsing><Icon name='dollar' /></Table.HeaderCell>}
				</Table.Row>
				}
			</Table.Header>
			<Table.Body>
				{members && members.map(member => {
					let votedTotal = member.theme.allocations.reduce((sum, allocation) => { return sum + allocation.amount }, 0);
					let votesComplete = votedTotal === member.theme.amount;

					return(
						<Table.Row key={member._id}>
							<Table.Cell collapsing>{member.number ? member.number : ''}</Table.Cell>
							<Table.Cell>{`${member.firstName} ${member.lastName}`}</Table.Cell>
							<Table.Cell>{numeral(member.theme.amount || 0).format('$0,0.00')}</Table.Cell>
							{votingColspan > 0 && <React.Fragment>
								{settings.useKioskChitVoting && <Table.Cell></Table.Cell>}
								{settings.useKioskFundsVoting && <Table.Cell>
									{votesComplete && <Icon color='green' name='check' />}
								</Table.Cell>}
							</React.Fragment>}
							{!props.hideAdminFields &&
								<Table.Cell collapsing><Button icon='trash' onClick={() => removeMember(member._id)} /></Table.Cell>
							}
						</Table.Row>
					)
				})}
			</Table.Body>
		</Table>
	);
}

export default MembersList;

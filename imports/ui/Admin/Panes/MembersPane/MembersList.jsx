import React, { useState } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

// import phones from 'libphonenumber-js';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { MemberMethods } from '/imports/api/methods';

import { Table, Icon, Button, Pagination } from 'semantic-ui-react';

const MembersList = observer(props => {
	const { theme, settings, members } = useData();
	const [ page, setPage ] = useState(0);
	const [ itemsPerPage, setItemsPerPage ] = useState(10);

	console.log({ page });

	const removeMember = id => {
		MemberMethods.removeMemberFromTheme.call({ memberId: id, themeId: theme._id });
	};

	const removeAllMembers = () => {
		MemberMethods.removeAllMembers.call(theme._id);
	};

	let votingColspan = 0;
	if(settings.useKioskChitVoting) votingColspan++;
	if(settings.useKioskFundsVoting) votingColspan++;

	return (
		<>
			<Table size='small' sortable striped celled structured>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell rowSpan="2" collapsing>Initials</Table.HeaderCell>
						<Table.HeaderCell rowSpan="2" collapsing><Icon name='hashtag' /></Table.HeaderCell>
						<Table.HeaderCell rowSpan="2">Member Name</Table.HeaderCell>
						<Table.HeaderCell rowSpan="2">Phone</Table.HeaderCell>
						<Table.HeaderCell rowSpan="2">Funds</Table.HeaderCell>
						{ votingColspan > 0 &&
							<Table.HeaderCell colSpan={ votingColspan } collapsing textAlign="center">Voting</Table.HeaderCell>
						}
						{ !props.hideAdminFields && ( <>
							<Table.HeaderCell rowSpan="2" collapsing>Code</Table.HeaderCell>
							<Table.HeaderCell rowSpan="2" collapsing>
								<Button icon='trash' color='red' onClick={ removeAllMembers } />
							</Table.HeaderCell>
						</> ) }
					</Table.Row>
					{ votingColspan > 0 && (
						<Table.Row>
							{ settings.useKioskChitVoting && <Table.HeaderCell collapsing><Icon name='cog' /></Table.HeaderCell> }
							{ settings.useKioskFundsVoting && <Table.HeaderCell collapsing><Icon name='dollar' /></Table.HeaderCell> }
						</Table.Row>
					) }
				</Table.Header>
				<Table.Body>
					{ members.values && members.values.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map(member => { 
						const votedTotal = member.theme.allocations.reduce((sum, allocation) => { return sum + allocation.amount; }, 0);
						const votesComplete = votedTotal === member.theme.amount;
						const fullName = member.fullName ? member.fullName : `${member.firstName} ${member.lastName}`;
						const phone = member.phone ? member.phone : '';

						return(
							<Table.Row key={ member._id }>
								<Table.Cell>{ member.initials ? member.initials : '' }</Table.Cell>
								<Table.Cell>{ member.number ? member.number : '' }</Table.Cell>
								<Table.Cell>{ fullName }</Table.Cell>
								<Table.Cell>{ phone }</Table.Cell>
								<Table.Cell>{ numeral(member.theme.amount || 0).format('$0,0') }</Table.Cell>
								{ votingColspan > 0 && <React.Fragment>
									{ settings.useKioskChitVoting && <Table.Cell></Table.Cell> }
									{ settings.useKioskFundsVoting && <Table.Cell>
										{ votesComplete && <Icon color='green' name='check' /> }
									</Table.Cell> }
								</React.Fragment> }
								{ !props.hideAdminFields && <React.Fragment>
									<Table.Cell>
										{ member.code ? member.code : '' }
									</Table.Cell>
									<Table.Cell>
										<Button icon='trash' onClick={ () => removeMember(member._id) } />
									</Table.Cell>
								</React.Fragment> }
							</Table.Row>
						);
					}) }
				</Table.Body>
			</Table>
			{ members.values.length / itemsPerPage > 1 && <Pagination
				attached='bottom'
				style={ { width: '100%' } }
				activePage={ page + 1 }
				totalPages={ parseInt(members.values.length / itemsPerPage) + 1 } 
				onPageChange={ (e, { activePage }) => setPage(activePage - 1) }
			/> }
		</>
	);
});

MembersList.propTypes = {
	hideAdminFields: PropTypes.bool
};

export default MembersList;

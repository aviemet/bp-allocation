import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import { paginate } from '/imports/lib/utils';

import { observer } from 'mobx-react-lite';
import { useTheme, useSettings, useMembers } from '/imports/api/providers';
import { MemberMethods } from '/imports/api/methods';

import { Table, Icon, Button, Dropdown } from 'semantic-ui-react';
import TablePagination from '/imports/ui/Components/TablePagination';
import EditableText from '/imports/ui/Components/EditableText';
import ConfirmationModal from '/imports/ui/Components/ConfirmationModal';

const MembersList = observer(props => {
	const { theme } = useTheme();
	const { settings } = useSettings();
	const { members } = useMembers();
	
	const [ page, setPage ] = useState(0);
	const [ itemsPerPage/*, setItemsPerPage*/ ] = useState(10);
	const [ sortColumn, setSortColumn ] = useState();
	const [ sortDirection, setSortDirection ] = useState();

	const [ modalOpen, setModalOpen ] = useState(false);
	const [ modalHeader, setModalHeader ] = useState('');
	const [ modalContent, setModalContent ] = useState('');
	const [ modalAction, setModalAction ] = useState();

	const removeMember = id => () => {
		MemberMethods.removeMemberFromTheme.call({ memberId: id, themeId: theme._id });
	};

	const removeAllMembers = () => {
		MemberMethods.removeAllMembers.call(theme._id);
	};

	const updateMember = (id, field) => value => {
		let data = {};
		data[field] = value;
		MemberMethods.update.call({ id: id, data });
	};

	const updateMemberTheme = (id, field) => value => {
		let data = {};
		data[field] = value;
		MemberMethods.updateTheme.call({ id: id, data });
	};

	const sortMembersTable = clickedColumn => () => {
		if(sortColumn !== clickedColumn) {
			setSortColumn(clickedColumn);
			setSortDirection('ascending');
		} else {
			setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
		}
	};

	const resetMemberVotes = id => () => MemberMethods.resetVotes.call(id);

	useEffect(() => {
		if(sortColumn && sortDirection) members.sortBy(sortColumn, sortDirection);
	}, [sortColumn, sortDirection, members.filteredMembers.length]);

	// Adjusts 2 row heading values for kisok voting headers
	let votingColspan = 0;
	if(settings.useKioskChitVoting) votingColspan++;
	if(settings.useKioskFundsVoting) votingColspan++;

	return (
		<>
			<Table size='small' sortable striped celled structured>
				<Table.Header>
					<Table.Row>

						<Table.HeaderCell 
							sorted={ sortColumn === 'initials' ? sortDirection : null }
							onClick={ sortMembersTable('initials') }
							rowSpan="2" 
							collapsing
						>Initials
						</Table.HeaderCell>

						<Table.HeaderCell 
							sorted={ sortColumn === 'number' ? sortDirection : null }
							onClick={ sortMembersTable('number') }
							rowSpan="2" 
							collapsing
						><Icon name='hashtag' />
						</Table.HeaderCell>

						<Table.HeaderCell 
							sorted={ sortColumn === 'fullName' ? sortDirection : null }
							onClick={ sortMembersTable('fullName') }
							rowSpan="2"
						>Member Name
						</Table.HeaderCell>

						<Table.HeaderCell 
							sorted={ sortColumn === 'phone' ? sortDirection : null }
							onClick={ sortMembersTable('phone') }
							rowSpan="2"
						>Phone
						</Table.HeaderCell>

						<Table.HeaderCell 
							sorted={ sortColumn === 'theme.amount' ? sortDirection : null }
							onClick={ sortMembersTable('theme.amount') }
							rowSpan="2"
						>Funds
						</Table.HeaderCell>

						{ votingColspan > 0 &&
							<Table.HeaderCell
								colSpan={ votingColspan } 
								collapsing 
								textAlign="center"
							>Voting
							</Table.HeaderCell>
						}

						{ !props.hideAdminFields && ( <>
							<Table.HeaderCell
								sorted={ sortColumn === 'code' ? sortDirection : null }
								onClick={ sortMembersTable('code') } 
								rowSpan="2" 
								collapsing
							>Code
							</Table.HeaderCell>

							<Table.HeaderCell rowSpan="2" collapsing>
								<Button icon='trash' color='red' onClick={ () => {
									setModalHeader('Permanently Unlink All Members From This Theme?');
									setModalContent('This will permanently remove all member information including donated funds and vote allocations from this theme. It will not remove the Member record.');
									setModalAction( () => { return removeAllMembers; } );
									setModalOpen(true);
								} } />
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
					{ members.filteredMembers && paginate(members.filteredMembers, page, itemsPerPage).map(member => { 
						const votedTotal = member.theme.allocations.reduce((sum, allocation) => { return sum + allocation.amount; }, 0);
						const fullName = member.fullName ? member.fullName : `${member.firstName} ${member.lastName}`;
						const phone = member.phone ? member.phone : '';

						return (
							<Table.Row key={ member._id }>

								<EditableText as={ Table.Cell } onSubmit={ updateMember(member._id, 'initials') }>{ member.initials ? member.initials : '' }</EditableText>

								<EditableText as={ Table.Cell } onSubmit={ updateMember(member._id, 'number') }>{ member.number ? member.number : '' }</EditableText>

								<EditableText as={ Table.Cell } onSubmit={ updateMember(member._id, 'fullName') }>{ fullName }</EditableText>

								<EditableText as={ Table.Cell } onSubmit={ updateMember(member._id, 'phone') }>{ phone }</EditableText>

								<EditableText 
									as={ Table.Cell } 
									inputType='number' 
									onSubmit={ updateMemberTheme(member.theme._id, 'amount') }
									format={ value => numeral(value).format('$0,0') }
								>
									{ member.theme.amount || 0 }
								</EditableText>
								
								{ votingColspan > 0 && <>
									{ settings.useKioskChitVoting && <Table.Cell>

									</Table.Cell> }

									{ settings.useKioskFundsVoting && <Table.Cell>
										{ (votedTotal === member.theme.amount) && <Icon color='green' name='check' /> }
										{ (votedTotal < 0 || votedTotal > member.theme.amount) && <Icon color='red' name='ban' /> }
									</Table.Cell> }
								</> }

								<EditableText as={ Table.Cell } onSubmit={ updateMember(member._id, 'code') }>{ member.code ? member.code : '' }</EditableText>

								<Table.Cell singleLine>
									
									<Dropdown text='Actions' className='link item' direction='left'>
										<Dropdown.Menu>
											<Dropdown.Item onClick={ () => window.open(`/voting/${theme._id}/${member._id}`) }>Voting Screen <Icon name='external' /></Dropdown.Item>
											<Dropdown.Divider />
											<Dropdown.Item onClick={ () => {
												setModalHeader(`Permanently Delete ${member.fullName}'s Votes?`);
												setModalContent(`This will permanently delete the voting history of ${member.fullName} for this theme. This operation cannot be undone.`);
												setModalAction( () => resetMemberVotes(member.theme._id) );
												setModalOpen(true);
											} }>Reset Votes</Dropdown.Item>
											<Dropdown.Divider />
											<Dropdown.Item onClick={ () => {
												setModalHeader(`Permanently Unlink ${member.fullName} From This Theme?`);
												setModalContent(`This will permanently remove ${member.fullName} from this theme. It will not remove the Member record.`);
												setModalAction( () => removeMember(member._id) );
												setModalOpen(true);
											} } ><Icon name='trash' />Delete Theme</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>

								</Table.Cell>

							</Table.Row>
						);
					}) }
				</Table.Body>
			</Table>
			<TablePagination
				itemsPerPage={ itemsPerPage }
				totalRecords={ members.filteredMembers.length }
				totalPages={ parseInt(members.filteredMembers.length / itemsPerPage) + 1 }
				onPageChange={ activePage => setPage(activePage) }
			/>
			<ConfirmationModal
				isModalOpen={ modalOpen }
				handleClose={ () => setModalOpen(false) }
				header={ modalHeader }
				content={ modalContent }
				confirmAction={ modalAction }
			/>
		</>
	);
});

MembersList.propTypes = {
	hideAdminFields: PropTypes.bool
};

ConfirmationModal.propTypes = { 
	header: PropTypes.string, 
	content: PropTypes.string, 
	isModalOpen: PropTypes.bool, 
	handleClose: PropTypes.func, 
	confirmAction: PropTypes.func
};

export default MembersList;
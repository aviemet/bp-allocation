import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { toJS } from 'mobx';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { MemberMethods } from '/imports/api/methods';

import { Table, Icon, Button, Modal } from 'semantic-ui-react';
import TablePagination from '/imports/ui/Components/TablePagination';

const ConfirmationModal = ({ header, content, isModalOpen, handleClose, confirmAction }) => {
	console.log({ confirmAction });
	return(
		<Modal 
			centered={ false }
			open={ isModalOpen }
			onClose={ handleClose }
		>
			<Modal.Header>{ header }</Modal.Header>
			<Modal.Content>{ content }</Modal.Content>
			<Modal.Actions>
				<Button 
					color='green' 
					onClick={ handleClose }
				>Cancel
				</Button>

				<Button 
					color='red' 
					onClick={ () => {
						handleClose();
						confirmAction();
					} }
				>Delete!
				</Button>

			</Modal.Actions>
		</Modal>
	);			
}

const MembersList = observer(props => {
	const { theme, settings, members } = useData();
	const [ page, setPage ] = useState(0);
	const [ itemsPerPage, setItemsPerPage ] = useState(10);
	const [ sortColumn, setSortColumn ] = useState();
	const [ sortDirection, setSortDirection ] = useState();

	const [ modalOpen, setModalOpen ] = useState(false);
	const [ modalHeader, setModalHeader ] = useState('');
	const [ modalContent, setModalContent ] = useState('');
	const [ modalAction, setModalAction ] = useState();

	const removeMember = id => {
		MemberMethods.removeMemberFromTheme.call({ memberId: id, themeId: theme._id });
	};

	const removeAllMembers = () => {
		MemberMethods.removeAllMembers.call(theme._id);
	};

	const sortMembersTable = clickedColumn => () => {
		if(sortColumn !== clickedColumn) {
			setSortColumn(clickedColumn)
			setSortDirection('ascending')
		} else {
			setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
		}
	};

	useEffect(() => {
		if(sortColumn && sortDirection) members.sortBy(sortColumn, sortDirection);
	}, [sortColumn, sortDirection, members.values.length]);

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
							sorted={ sortColumn === 'initials' ? sortDirection : null}
							onClick={ sortMembersTable('initials') }
							rowSpan="2" 
							collapsing
						>Initials
						</Table.HeaderCell>

						<Table.HeaderCell 
							sorted={ sortColumn === 'number' ? sortDirection : null}
							onClick={ sortMembersTable('number') }
							rowSpan="2" 
							collapsing
						><Icon name='hashtag' />
						</Table.HeaderCell>

						<Table.HeaderCell 
							sorted={ sortColumn === 'fullName' ? sortDirection : null}
							onClick={ sortMembersTable('fullName') }
							rowSpan="2"
						>Member Name
						</Table.HeaderCell>

						<Table.HeaderCell 
							sorted={ sortColumn === 'phone' ? sortDirection : null}
							onClick={ sortMembersTable('phone') }
							rowSpan="2"
						>Phone
						</Table.HeaderCell>

						<Table.HeaderCell 
							sorted={ sortColumn === 'theme.amount' ? sortDirection : null}
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
									setModalAction( () => { return removeAllMembers } );
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
										<Button icon='trash' onClick={ () => {
											setModalHeader(`Permanently Unlink ${member.fullName} From This Theme?`);
											setModalContent(`This will permanently remove ${member.fullName} from this theme. It will not remove the Member record.`);
											setModalAction( () => { return () => removeMember(member._id) } );
											setModalOpen(true);
										} } />
									</Table.Cell>
								</React.Fragment> }
							</Table.Row>
						);
					}) }
				</Table.Body>
			</Table>
			<TablePagination
				itemsPerPage={ itemsPerPage }
				totalRecords={ members.values.length }
				totalPages={ parseInt(members.values.length / itemsPerPage) + 1 }
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

export default MembersList;
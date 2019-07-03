import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import numeral from 'numeral';

import { useOrganizations, useMembers } from '/imports/context';
import { OrganizationMethods } from '/imports/api/methods';

import { Container, Header, Table, Button } from 'semantic-ui-react';

import MemberSearch from '/imports/ui/Components/MemberSearch';

const Pledges = props => {

	const { topOrgs } = useOrganizations();
	const { members, membersLoading } = useMembers();

	const deletePledge = (e, data) => {
		const pledgeId = data.pledgeid;
		const orgId = data.orgid;

		OrganizationMethods.removePledge.call({ orgId, pledgeId });
	};

	let pledges = [];
	topOrgs.map(org => {
		org.pledges.map(pledge => {
			pledges.push(Object.assign({
				org: {
					_id: org._id,
					title: org.title
				}
			}, pledge));
		});
	});
	pledges = _.sortBy(pledges, ['createdAt']);

	return (
		<Container>
			<Header as="h2">Matched Pledges</Header>
			<Table striped>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell collapsing>Organization</Table.HeaderCell>
						<Table.HeaderCell>Pledged By</Table.HeaderCell>
						<Table.HeaderCell collapsing>Amount</Table.HeaderCell>
						{!props.hideAdminFields &&
						<Table.HeaderCell collapsing></Table.HeaderCell>
						}
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{!membersLoading && pledges.map(pledge => (
						<Table.Row key={ pledge._id }>
							<Table.Cell singleLine>{pledge.org.title}</Table.Cell>
							<Table.Cell>
								{props.hideAdminFields ?
									pledge.member ? `${members[pledge.member].firstName} ${members[pledge.member].lastName}` : ''
									:
									<MemberSearch
										data={ members }
										pledgeid={ pledge._id }
									/>
								}
							</Table.Cell>
							<Table.Cell>{numeral(pledge.amount).format('$0,0')}</Table.Cell>
							<Table.Cell>
								{!props.hideAdminFields &&
								<Button
									color='red'
									icon='trash'
									onClick={ deletePledge }
									pledgeid={ pledge._id }
									orgid={ pledge.org._id }
								/>
								}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</Container>
	);
};

Pledges.propTypes = {
	hideAdminFields: PropTypes.bool
};

export default Pledges;


import React, { useContext } from 'react';
import _ from 'lodash';
import numeral from 'numeral';

import { OrganizationContext } from '/imports/context';
import { OrganizationMethods } from '/imports/api/methods';

import { Container, Header, Table, Input, Button } from 'semantic-ui-react';

const Pledges = props => {

	const { topOrgs } = useContext(OrganizationContext);

	const deletePledge = (e, data) => {
		const pledgeId = data.pledgeid;
		const orgId = data.orgid;

		OrganizationMethods.removePledge.call({orgId, pledgeId});
	}

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
						<Table.HeaderCell collapsing></Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{pledges.map(pledge => (
						<Table.Row key={pledge._id}>
							<Table.Cell>{pledge.org.title}</Table.Cell>
							<Table.Cell>
								<Input
									fluid
									type='text'
									pledgeid={pledge._id}
								/>
							</Table.Cell>
							<Table.Cell>{numeral(pledge.amount).format('$0,0')}</Table.Cell>
							<Table.Cell>
								<Button
									color='red'
									icon='trash'
									onClick={deletePledge}
									pledgeid={pledge._id}
									orgid={pledge.org._id}
								/>
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</Container>
  )
}

export default Pledges;


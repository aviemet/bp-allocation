import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import numeral from 'numeral';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';
import { OrganizationMethods } from '/imports/api/methods';

import { Container, Header, Table, Button } from 'semantic-ui-react';
import styled from 'styled-components';
import MemberSearch from '/imports/ui/Components/MemberSearch';

const PledgesContainer = styled(Container)`
	.ui.fluid.search .ui.icon.input {
		width: 100%;
	}
`;

const Pledges = observer(props => {
	const data = useData();
	const members = data.members.values;
	const topOrgs = data.orgs.topOrgs;

	const deletePledge = (e, data) => {
		const pledgeId = data.pledgeid;
		const orgId = data.orgid;

		OrganizationMethods.removePledge.call({ orgId, pledgeId });
	};

	const searchCallback = result => {
		console.log({ result });
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
		<PledgesContainer>
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
					{pledges.map(pledge => (
						<Table.Row key={ pledge._id }>
							<Table.Cell singleLine>{pledge.org.title}</Table.Cell>
							<Table.Cell>
								{props.hideAdminFields ?
									pledge.member ? `${members[pledge.member].firstName} ${members[pledge.member].lastName}` : ''
									:
									<MemberSearch
										data={ members }
										pledgeId={ pledge._id }
										callback={ searchCallback }
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
		</PledgesContainer>
	);
});

Pledges.propTypes = {
	hideAdminFields: PropTypes.bool
};

export default Pledges;


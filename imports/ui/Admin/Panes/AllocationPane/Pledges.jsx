import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import numeral from 'numeral';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/api/stores/lib/DataProvider';
import { OrganizationMethods } from '/imports/api/methods';

import { Container, Header, Table, Button } from 'semantic-ui-react';
import styled from 'styled-components';

const Pledges = observer(props => {
	const data = useData();
	const members = data.members.values;
	const pledges = data.orgs.pledges;

	const deletePledge = (e, data) => {
		const pledgeId = data.pledgeid;
		const orgId = data.orgid;

		OrganizationMethods.removePledge.call({ orgId, pledgeId });
	};

	return (
		<PledgesContainer>
			<Header as="h2">Matched Pledges (x{ data.theme.matchRatio })</Header>
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
					{pledges.map(pledge => {
						let member = pledge.member ? _.find(members, ['_id', pledge.member]) : '';
						return (
							<Table.Row key={ pledge._id }>
								<Table.Cell singleLine>{pledge.org.title}</Table.Cell>
								<Table.Cell>
									{ member && member.hasOwnProperty('formattedName') ? 
										member.formattedName :
										''
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
						);
					})}
				</Table.Body>
			</Table>
		</PledgesContainer>
	);
});

const PledgesContainer = styled(Container)`
	.ui.fluid.search .ui.icon.input {
		width: 100%;
	}
`;

Pledges.propTypes = {
	hideAdminFields: PropTypes.bool
};

export default Pledges;


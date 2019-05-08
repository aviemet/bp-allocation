import React, { useContext } from 'react';
import _ from 'lodash';

import { ThemeContext, OrganizationContext } from '/imports/context';
import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

import { sortTopOrgs } from '/imports/utils';

import { Table, Checkbox, Icon, Input, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import TopOrgsRow from './TopOrgsRow';
import ChitVotingActiveToggle from '/imports/ui/Components/Toggles/ChitVotingActiveToggle';


const NumTopOrgsInput = styled(Input)`
	width: 65px;

	&& input {
		padding: 0.3em 0.4em;
	}
`;

const TopOrgsByChitVote = props => {

	const { theme } = useContext(ThemeContext);
	const { orgs }  = useContext(OrganizationContext);

	const updateNumTopOrgs = (e, data) => {
		if(data.value !== theme.numTopOrgs){
			ThemeMethods.update.call({
				id: theme._id,
				data: {
					numTopOrgs: data.value
				}
			});
		}
	}

	let sortedOrgs = sortTopOrgs(theme, orgs);

	return (
		<React.Fragment>

			<Header as="h3" floated="right">
				<ChitVotingActiveToggle />
			</Header>

			<Header as="h1" floated="left">
				Top <NumTopOrgsInput size='mini' type='number' value={theme.numTopOrgs} onChange={updateNumTopOrgs} width={1} /> Organizations
			</Header>

			<Table celled>
				<Table.Header>
					<Table.Row>
						<Table.HeaderCell>Organization</Table.HeaderCell>
						<Table.HeaderCell collapsing>Votes</Table.HeaderCell>
						<Table.HeaderCell collapsing><Icon name="lock" /></Table.HeaderCell>
					</Table.Row>
				</Table.Header>

				<Table.Body>
				{sortedOrgs.map((org, i) => {
					const inTopOrgs = i < theme.numTopOrgs;
					const _isLocked = theme.topOrgsManual.includes(org._id);
					const _isSaved = (_.findIndex(theme.saves, ['org', org._id]) >= 0);

					return(
						<TopOrgsRow
							key={i}
							inTopOrgs={inTopOrgs}
							isLocked={_isLocked}
							isSaved={_isSaved}
							themeId={theme._id}
							org={org} />
					);

				})}
				</Table.Body>
			</Table>

		</React.Fragment>
	);
}

export default TopOrgsByChitVote;

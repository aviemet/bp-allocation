import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { Organizations } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { sortTopOrgs } from '/imports/utils';

import { Table, Checkbox, Icon, Input, Header, Button } from 'semantic-ui-react';
import styled from 'styled-components';

import TopOrgsRow from './TopOrgsRow';

const NumTopOrgsInput = styled(Input)`
	width: 65px;

	&& input {
		padding: 0.3em 0.4em;
	}
`;

export default class TopOrgsByChitVote extends React.Component {
	constructor(props) {
		super(props);
	}

	updateNumTopOrgs = (e, data) => {
		if(data.value !== this.props.theme.numTopOrgs){
			ThemeMethods.update.call({id: this.props.theme._id, data: {numTopOrgs: data.value}});
		}
	}

	/**
	 * Togle boolean values on the Theme model
	 */
	toggleThemeValue = (e, data) => {
		let tempData = {};
		tempData[data.index] = data.checked;

		ThemeMethods.update.call({id: this.props.themeId, data: tempData});
	}

	render() {
		let orgs = sortTopOrgs(this.props.theme, this.props.organizations);

		return (
			<React.Fragment>

				<Header as="h3" floated="right">
					<Checkbox label='Chit Voting Active' toggle index='chit_voting_active' onClick={this.toggleThemeValue} checked={this.props.theme.chit_voting_active || false} />
				</Header>
				<Header as="h1" floated="left">
					Top <NumTopOrgsInput size='mini' type='number' value={this.props.theme.numTopOrgs} onChange={this.updateNumTopOrgs} width={1} /> Organizations
				</Header>

				<Table celled>
					<Table.Header>
						<Table.Row>
							<Table.HeaderCell>Organization</Table.HeaderCell>
							<Table.HeaderCell>Votes</Table.HeaderCell>
							<Table.HeaderCell><Icon name="lock" /></Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
					{orgs.map((org, i) => {
						let inTopOrgs = i < this.props.theme.numTopOrgs;
						return(<TopOrgsRow inTopOrgs={inTopOrgs} key={i} theme={this.props.theme} org={org} />);

					})}
					</Table.Body>
				</Table>

			</React.Fragment>
		);
	}
}

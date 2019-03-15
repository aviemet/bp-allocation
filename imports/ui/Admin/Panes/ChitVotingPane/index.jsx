import Meter from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { Organizations } from '/imports/api';

import { ThemeContext } from '/imports/ui/Contexts';

import { Loader, Grid, Table, Header, Segment, Container } from 'semantic-ui-react';

import ChitInputs from './ChitInputs';
import TopOrgsByChitVote from './TopOrgsByChitVote';
import SavedOrg from './SavedOrg';

export default class ChitVotingPane extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
		  <React.Fragment>
				<Grid columns={2} divided>
					<Grid.Row>

						<Grid.Column>

							<Table celled striped unstackable columns={3}>
								<Table.Header>
									<Table.Row>
										<Table.HeaderCell>Organization</Table.HeaderCell>
										<Table.HeaderCell>Weight of Tokens</Table.HeaderCell>
										<Table.HeaderCell>Token Count</Table.HeaderCell>
									</Table.Row>
								</Table.Header>

								<Table.Body>
								{this.props.orgs.map((org, i) => (
									<ChitInputs organization={org} key={i} tabInfo={{index: i+1, length: this.props.orgs.length}} />
								))}
								</Table.Body>
							</Table>

						</Grid.Column>

						<Grid.Column>
								<TopOrgsByChitVote organizations={this.props.orgs} theme={this.props.theme} />
						</Grid.Column>

					</Grid.Row>
				</Grid>
				{this.props.theme.saves && this.props.theme.saves.length > 0 && <Container>
					<Header as="h2">Saved Orgs</Header>
					<Grid columns={2}>

						<Grid.Row>
						{this.props.theme.saves.map((save, i) => <SavedOrg org={_.filter(this.props.orgs, ['_id', save.org])[0]} save={save} key={i} /> )}
						</Grid.Row>

					</Grid>
				</Container>}
		  </React.Fragment>
		);
	}
}

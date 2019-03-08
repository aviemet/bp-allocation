import Meter from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { Organizations } from '/imports/api';

import { ThemeContext } from '/imports/ui/Contexts';

import { Loader, Grid, Table } from 'semantic-ui-react';

import ChitInputs from './ChitInputs';
import TopOrgsByChitVote from './TopOrgsByChitVote';

export default class ChitVotingPane extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			// <ThemeContext.Consumer>{(context) => (
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
									<ChitInputs organization={org} key={i} />
								))}
								</Table.Body>
							</Table>

						</Grid.Column>

						<Grid.Column>
								<TopOrgsByChitVote organizations={this.props.orgs} theme={this.props.theme} />
						</Grid.Column>

					</Grid.Row>
				</Grid>
			// )}</ThemeContext.Consumer>
		);
	}
}

// export default withTracker(({themeId}) => {
// 	let orgsHandle = Meteor.subscribe('organizations');
//
// 	return {
// 		loading: !orgsHandle.ready(),
// 		organizations: Organizations.find({theme: themeId}).fetch()
// 	}
// })(ChitVotingPane);

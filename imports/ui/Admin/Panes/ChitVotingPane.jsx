import Meter from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { Organizations } from '/imports/api';

import { ThemeContext } from '/imports/ui/Contexts';

import { Loader, Grid, Table } from 'semantic-ui-react';

import ChitInputs from '/imports/ui/Admin/Panes/ChitInputs';
import TopOrgsByChitVote from '/imports/ui/Admin/Panes/TopOrgsByChitVote';

const ThemeConsumer = ThemeContext.Consumer;

class ChitVotingPane extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if(this.props.loading){
			return(<Loader />);
		}
		return (

			<Grid columns={2} divided>
				<Grid.Row>

					<Grid.Column>

						<Table celled striped unstackable>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Organization</Table.HeaderCell>
									<Table.HeaderCell>Weight of Tokens</Table.HeaderCell>
									<Table.HeaderCell>Token Count</Table.HeaderCell>
								</Table.Row>
							</Table.Header>

							<Table.Body>
							{this.props.organizations.map((org, i) => (
								<ChitInputs organization={org} key={i} />
							))}
							</Table.Body>
						</Table>

					</Grid.Column>

					<Grid.Column>
						<ThemeConsumer>{(theme) => (
							<TopOrgsByChitVote organizations={this.props.organizations} theme={theme} />
						)}</ThemeConsumer>
					</Grid.Column>

				</Grid.Row>
			</Grid>
		);
	}
}

export default withTracker(({themeId}) => {
	let orgsHandle = Meteor.subscribe('organizations');

	return {
		loading: !orgsHandle.ready(),
		organizations: Organizations.find({theme: themeId}).fetch()
	}
})(ChitVotingPane);

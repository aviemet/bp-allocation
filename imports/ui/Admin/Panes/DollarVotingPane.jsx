import Meter from 'meteor/meteor';
import React from 'react';
import { Link } from 'react-router-dom'

import { withTracker } from 'meteor/react-meteor-data';

import { ThemeMethods } from '/imports/api/methods';
import { Themes, Organizations } from '/imports/api';

import { ThemeContext } from '/imports/ui/Contexts';

import { Loader, Grid, Table, Checkbox, Input, Label, Button, Form } from 'semantic-ui-react';

import _ from 'underscore';

import DollarVotingInputs from '/imports/ui/Admin/Panes/DollarVotingInputs';

class DollarVotingPane extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			leverage: this.props.theme.leverage_total,
			match: false
		};

		this.toggleMatch = this.toggleMatch.bind(this);
		this.handleLeverageChange = this.handleLeverageChange.bind(this);
		this.updateThemeLeverage = this.updateThemeLeverage.bind(this);
		this.resetLeverage = this.resetLeverage.bind(this);
		this.toggleShowLeverage = this.toggleShowLeverage.bind(this);
	}

	toggleMatch(){
		this.setState({ match: !this.state.match });
	}

	handleLeverageChange(e, data) {
		this.setState({leverage: data.value});
	}

	updateThemeLeverage(){
		ThemeMethods.update.call({id: this.props.theme._id, data: { leverage_total: this.state.leverage }});
	}

	resetLeverage(){
		ThemeMethods.update.call({id: this.props.theme._id, data: { leverage_used: 0 }});
	}

	toggleShowLeverage(e, data){
		ThemeMethods.update.call({id: this.props.theme._id, data: { leverage_visible: data.checked } });
	}

	render() {
		if(this.props.loading){
			return(<Loader />);
		}
		return (
			<Grid>
				<Grid.Row columns='equal'>
					<Grid.Column>
						<Link to={`/simulation/${this.props.theme._id}`} target='_blank'>
						<Button>Simulate</Button>
						</Link>
					</Grid.Column>
					<Grid.Column>
						<Checkbox label='Show Leverage' toggle onClick={this.toggleShowLeverage} checked={this.props.theme.leverage_visible || false} />
					</Grid.Column>
					<Grid.Column textAlign='right' width={8}>
				 		<Input icon='dollar sign' iconPosition='left' label={{ tag: true, content: 'Leverage' }} labelPosition='right' placeholder='Enter leverage' onChange={this.handleLeverageChange} onBlur={this.updateThemeLeverage} value={this.state.leverage} />
				 		<Button onClick={this.resetLeverage}>Reset Leverage</Button>
				 	</Grid.Column>
				</Grid.Row>

				<Grid.Row>
					<Grid.Column>

						<Table celled striped unstackable>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Organization</Table.HeaderCell>
									<Table.HeaderCell>Adjustment</Table.HeaderCell>
									<Table.HeaderCell>Match &nbsp;
										<Checkbox fitted toggle onClick={this.toggleMatch} checked={this.state.match} />
									</Table.HeaderCell>
									<Table.HeaderCell>Funded</Table.HeaderCell>
									<Table.HeaderCell>Ask</Table.HeaderCell>
									<Table.HeaderCell>Actions</Table.HeaderCell>
								</Table.Row>
							</Table.Header>

							<Table.Body>
							{this.props.organizations.map((org, i) => (
								<DollarVotingInputs org={org} key={i} match={this.state.match} />
							))}
							</Table.Body>
						</Table>

				 	</Grid.Column>
				</Grid.Row>
			</Grid>
		);
	}

}

export default withTracker(({theme}) => {
	let orgs = [];
	let orgsHandle = Meteor.subscribe('organizations', theme._id);

	orgs = Organizations.find({theme: theme._id}).fetch();

	if(orgsHandle.ready() && !_.isEmpty(orgs) && !_.isEmpty(theme) && "topOrgsManual" in theme){
		orgs = ThemeMethods.filterTopOrgs(theme, orgs);
	}

	return {
		loading: !orgsHandle.ready(),
		organizations: orgs
	}
})(DollarVotingPane);

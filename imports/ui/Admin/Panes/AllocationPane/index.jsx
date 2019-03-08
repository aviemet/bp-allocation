import Meter from 'meteor/meteor';
import React from 'react';
import { Link } from 'react-router-dom'
import _ from 'underscore';

import { withTracker } from 'meteor/react-meteor-data';
import numeral from 'numeral';

import { ThemeMethods } from '/imports/api/methods';
import { Themes, Organizations } from '/imports/api';

import { withContext } from '/imports/ui/Contexts';

import { Loader, Grid, Table, Checkbox, Button, Statistic, Segment, Header } from 'semantic-ui-react';
import styled from 'styled-components';

import AllocationInputs from './AllocationInputs';

const Arithmetic = styled.span`
	font-size: 2rem;
	display: inline-flex;
  flex: 0 1 auto;
  flex-direction: column;
  font-family: 'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif;
  font-weight: normal;
  line-height: 1em;
  color: #1b1c1d;
  text-align: center;
`;

class AllocationPane extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			leverage: props.theme.leverage_total,
			match: true,
			voteAllocated: 0,
			crowdFavorite: 0
		};

// 		this.toggleMatch = this.toggleMatch.bind(this);
		this.handleLeverageChange = this.handleLeverageChange.bind(this);
		this.updateThemeLeverage = this.updateThemeLeverage.bind(this);
		this.toggleShowLeverage = this.toggleShowLeverage.bind(this);
		this.calculateCrowdFavorite = this.calculateCrowdFavorite.bind(this);
	}

	componentDidMount() {
		let crowdFavorite = this.calculateCrowdFavorite();
		if(crowdFavorite !== false && this.state.crowdFavorite !== crowdFavorite){
			this.setState({crowdFavorite: crowdFavorite});
		}
	}

	componentDidUpdate(prevProps, prevState) {
		let voteAllocated = 0;
		this.props.orgs.map((org) => {
			voteAllocated += parseInt(org.amount_from_votes || 0);
			if(org.topoff > 0){
				voteAllocated += org.topoff;
			}
		});
		if(this.state.voteAllocated !== voteAllocated){
			this.setState({voteAllocated: voteAllocated});
		}

		let crowdFavorite = this.calculateCrowdFavorite();
		if(crowdFavorite !== false && this.state.crowdFavorite !== crowdFavorite){
			this.setState({crowdFavorite: crowdFavorite});
		}
	}

	// toggleMatch() {
	// 	this.setState({ match: !this.state.match });
	// }

	handleLeverageChange(e, data) {
		this.setState({leverage: data.value});
	}

	updateThemeLeverage() {
		ThemeMethods.update.call({id: this.props.theme._id, data: { leverage_total: this.state.leverage }});
	}

	toggleShowLeverage(e, data) {
		ThemeMethods.update.call({id: this.props.theme._id, data: { leverage_visible: data.checked } });
	}

	calculateCrowdFavorite() {
		let allEntered = true;
		let favorite = 0;
		this.props.orgs.map((org, i) => {
			if(org.amount_from_votes == 0){
				allEntered = false;
			}
			if(org.amount_from_votes > this.props.orgs[favorite].amount_from_votes){
				favorite = i;
			}
		});
		return allEntered ? favorite : false;
	}

	render() {
		if(this.props.loading){
			return(<Loader />);
		}
		return (
			<Grid>

				{/* Breakdown Segment */}
				<Grid.Row>
					<Grid.Column>
						<Segment>
							<Statistic.Group size='tiny'>

								<Statistic>
									<Statistic.Value>{numeral(this.props.theme.leverage_total).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Total Pot</Statistic.Label>
								</Statistic>

								<Arithmetic>-</Arithmetic>

								<Statistic>
									<Statistic.Value>{numeral(this.state.voteAllocated).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Votes + Topoff</Statistic.Label>
								</Statistic>

								<Arithmetic>=</Arithmetic>

								<Statistic>
									<Statistic.Value>{numeral(this.props.theme.leverage_total - this.state.voteAllocated).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Starting Leverage</Statistic.Label>
								</Statistic>

								<Arithmetic>-</Arithmetic>

								<Statistic>
									<Statistic.Value>{numeral(this.props.theme.leverage_used).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Pledges</Statistic.Label>
								</Statistic>

								<Arithmetic>=</Arithmetic>

								<Statistic>
									<Statistic.Value>{numeral(this.props.theme.leverage_total - this.state.voteAllocated - this.props.theme.leverage_used).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Remaining</Statistic.Label>
								</Statistic>

							</Statistic.Group>
						</Segment>

				 	</Grid.Column>
				</Grid.Row>

				<Grid.Row>
					<Grid.Column width={10}>
						<Header as="h2">Top 5 Funds Allocation</Header>
					</Grid.Column>

					<Grid.Column width={2} align="right">
						<Link to={`${this.props.url}/simulation/`} target='_blank'>
							<Button>Simulate</Button>
						</Link>
					</Grid.Column>

					<Grid.Column width={4}>
						<Checkbox label='Show Leverage' toggle onClick={this.toggleShowLeverage} checked={this.props.theme.leverage_visible || false} />
					</Grid.Column>

				</Grid.Row>
				<Grid.Row>
					<Grid.Column>

						<Table celled striped unstackable>
							<Table.Header>
								<Table.Row>
									<Table.HeaderCell>Organization</Table.HeaderCell>
									<Table.HeaderCell>Voted Amount</Table.HeaderCell>
									<Table.HeaderCell>Matched Pledges</Table.HeaderCell>
									{/*<Table.HeaderCell>
										<Checkbox fitted toggle onClick={this.toggleMatch} checked={this.state.match} />
										<br/>
										Match
									</Table.HeaderCell>*/}
									<Table.HeaderCell>Funded</Table.HeaderCell>
									<Table.HeaderCell>Ask</Table.HeaderCell>
									<Table.HeaderCell>%</Table.HeaderCell>
									<Table.HeaderCell>Actions</Table.HeaderCell>
								</Table.Row>
							</Table.Header>

							<Table.Body>
							{this.props.orgs.map((org, i) => (
								<AllocationInputs org={org} key={i} match={this.state.match} crowdFavorite={(i === this.state.crowdFavorite)} />
							))}
							</Table.Body>
						</Table>

				 	</Grid.Column>
				</Grid.Row>
			</Grid>
		);
	}

}

export default AllocationPane;

// export default withTracker(({theme}) => {
// 	let orgs = [];
// 	let orgsHandle = Meteor.subscribe('organizations', theme._id);
//
// 	orgs = Organizations.find({theme: theme._id}).fetch();
//
// 	if(orgsHandle.ready() && !_.isEmpty(orgs) && !_.isEmpty(theme) && "topOrgsManual" in theme){
// 		orgs = ThemeMethods.filterTopOrgs(theme, orgs);
// 	}
//
// 	return {
// 		loading: !orgsHandle.ready(),
// 		organizations: orgs
// 	}
// })(AllocationPane);

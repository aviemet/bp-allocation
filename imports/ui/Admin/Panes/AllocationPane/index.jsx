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
	}

	toggleShowLeverage = (e, data) => {
		ThemeMethods.update.call({id: this.props.theme._id, data: { leverage_visible: data.checked } });
	}

	_calculateCrowdFavorite = () => {
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

	_calculateVoteAllocated = () => {
		let voteAllocated = 0;
 		this.props.orgs.map((org) => {
 			voteAllocated += parseInt(org.amount_from_votes || 0);
 			if(org.topoff > 0){
 				voteAllocated += org.topoff;
 			}
 		});
 		return voteAllocated;
	}

	render() {
		if(this.props.loading){
			return(<Loader />);
		}

		const saves = this.props.theme.saves.reduce((sum, save) => {return sum + save.amount}, 0);
		const voteAllocated = this._calculateVoteAllocated();
		const totalPot = this.props.theme.leverage_total + saves;
		const consolation = this.props.theme.consolation_active ?
			(this.props.theme.organizations.length - this.props.orgs.length) *
			(this.props.theme.consolation_amount || 10000) : 0;
		const votedFunds = voteAllocated;
		const leverage = this.props.theme.leverage_total - voteAllocated - consolation + saves;
		const pledges = this.props.theme.leverage_used;

		return (
			<Grid>

				{/* Breakdown Segment */}
				<Grid.Row>
					<Grid.Column>
						<Segment>
							<Statistic.Group size='tiny'>

								{/* Total amount to allocate */}
								<Statistic>
									<Statistic.Value>{numeral(totalPot).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Total Pot + Saves</Statistic.Label>
								</Statistic>

								<Arithmetic>-</Arithmetic>

								{/* Subtract 10k for each unchosen organization */}
								<Statistic>
									<Statistic.Value>{numeral(consolation).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Pulled/Others</Statistic.Label>
								</Statistic>

								<Arithmetic>-</Arithmetic>

								{/* Subtract funds from votes and topoff */}
								<Statistic>
									<Statistic.Value>{numeral(votedFunds).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Votes + Topoff + Saves</Statistic.Label>
								</Statistic>

								<Arithmetic>=</Arithmetic>

								{/* Leverage amount to begin pledge round */}
								<Statistic>
									<Statistic.Value>{numeral(leverage).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Starting Leverage</Statistic.Label>
								</Statistic>

								<Arithmetic>-</Arithmetic>

								{/* Subtract funds from pledge round */}
								<Statistic>
									<Statistic.Value>{numeral(pledges).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Pledges</Statistic.Label>
								</Statistic>

								<Arithmetic>=</Arithmetic>

								{/* Amount remaining to spread to winners */}
								<Statistic>
									<Statistic.Value>{numeral(this.props.theme.leverage_remaining).format('$0,0')}</Statistic.Value>
									<Statistic.Label>Remaining</Statistic.Label>
								</Statistic>

							</Statistic.Group>
						</Segment>

				 	</Grid.Column>
				</Grid.Row>

				<Grid.Row>
					<Grid.Column width={10}>
						<Header as="h2">Top {this.props.orgs.length} Funds Allocation</Header>
					</Grid.Column>

					<Grid.Column width={2} align="right">
						<Link to={`/simulation/${this.props.theme._id}`} target='_blank'>
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
									<Table.HeaderCell>Funded</Table.HeaderCell>
									<Table.HeaderCell>Ask</Table.HeaderCell>
									<Table.HeaderCell>Need</Table.HeaderCell>
									<Table.HeaderCell>Actions</Table.HeaderCell>
								</Table.Row>
							</Table.Header>

							<Table.Body>
							{this.props.orgs.map((org, i) => (
								<AllocationInputs
									key={i}
									org={org}
									theme={this.props.theme}
									crowdFavorite={(i === this._calculateCrowdFavorite())}
									tabInfo={{index: i+1, length: this.props.orgs.length}}
								/>
							))}
							</Table.Body>
						</Table>

				 	</Grid.Column>
				</Grid.Row>

				<Grid.Row columns={1}>
					<Grid.Column>
						<Header as="h2">Matched Pledges</Header>
					</Grid.Column>
				</Grid.Row>
			</Grid>
		);
	}

}

export default AllocationPane;

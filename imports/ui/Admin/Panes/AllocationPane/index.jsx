import Meter from 'meteor/meteor';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom'
import _ from 'lodash';

import numeral from 'numeral';

import { ThemeContext, OrganizationContext, PresentationSettingsContext } from '/imports/context';

import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

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

const AllocationPane = props => {

	const { theme } = useContext(ThemeContext);
	const { topOrgs } = useContext(OrganizationContext);
	const { settings } = useContext(PresentationSettingsContext);

	const toggleShowLeverage = (e, data) => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				leverageVisible: data.checked
			}
		});
	}

	const _calculateCrowdFavorite = () => {
		let allEntered = true;
		let favorite = 0;

		topOrgs.map((org, i) => {
			if(org.amountFromVotes == 0){
				allEntered = false;
			}
			if(org.amountFromVotes > topOrgs[favorite].amountFromVotes){
				favorite = i;
			}
		});
		return allEntered ? favorite : false;
	}

	const _calculateVoteAllocated = () => {
		let voteAllocated = 0;
 		topOrgs.map((org) => {
 			voteAllocated += parseInt(org.amountFromVotes || 0);
 			if(org.topOff > 0){
 				voteAllocated += org.topOff;
 			}
 		});
 		return voteAllocated;
	}

	const saves = theme.saves.reduce((sum, save) => {return sum + save.amount}, 0);
	const voteAllocated = _calculateVoteAllocated();
	const totalPot = theme.leverageTotal + saves;
	const consolation = theme.consolationActive ?
		(theme.organizations.length - topOrgs.length) *
		(theme.consolationAmount || 10000) : 0;
	const votedFunds = voteAllocated;
	const leverage = theme.leverageTotal - voteAllocated - consolation + saves;
	const pledges = theme.leverageUsed;

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

							{/* Subtract funds from votes and topOff */}
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
								<Statistic.Value>{numeral(theme.leverageRemaining).format('$0,0')}</Statistic.Value>
								<Statistic.Label>Remaining</Statistic.Label>
							</Statistic>

						</Statistic.Group>
					</Segment>

			 	</Grid.Column>
			</Grid.Row>

			<Grid.Row>
				<Grid.Column width={10}>
					<Header as="h2">Top {topOrgs.length} Funds Allocation</Header>
				</Grid.Column>

				<Grid.Column width={2} align="right">
					<Link to={`/simulation/${theme._id}`} target='_blank'>
						<Button>Simulate</Button>
					</Link>
				</Grid.Column>

				<Grid.Column width={4}>
					<Checkbox label='Show Leverage' toggle onClick={toggleShowLeverage} checked={settings.leverageVisible || false} />
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
						{topOrgs.map((org, i) => (
							<AllocationInputs
								key={i}
								org={org}
								theme={theme}
								crowdFavorite={(i === _calculateCrowdFavorite())}
								tabInfo={{index: i+1, length: topOrgs.length}}
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

export default AllocationPane;

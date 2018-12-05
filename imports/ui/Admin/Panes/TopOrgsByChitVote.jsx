import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { Organizations } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Loader, Grid, Table, Checkbox, Icon, Input } from 'semantic-ui-react';
import styled from 'styled-components';

import _ from 'underscore';

const NumTopOrgsInput = styled(Input)`
	width: 65px;

	&& input {
		padding: 0.3em 0.4em;
	}
`;

export default class TopOrgsByChitVote extends React.Component {
	constructor(props) {
		super(props);

		var preState = {
			numTopOrgs: this.props.theme.numTopOrgs,
			calcNumTopOrgs: Math.max(this.props.theme.numTopOrgs, this.props.theme.topOrgsManual.length)
		};

		// Add each manually "Top Org" to state
		this.props.theme.topOrgsManual.map((org) => {
			preState[org] = true;
		});

		this.state = preState;

		this.topOrgToggle = this.topOrgToggle.bind(this);
		this.sortTopOrgs = this.sortTopOrgs.bind(this);
		this.updateNumTopOrgs = this.updateNumTopOrgs.bind(this);
	}

	updateNumTopOrgs(e, data) {
		if(data.value !== this.props.theme.numTopOrgs){
			ThemeMethods.update.call({id: this.props.theme._id, data: {numTopOrgs: data.value}});
			this.setState({
				numTopOrgs: data.value,
				calcNumTopOrgs: Math.max(data.value, this.props.theme.topOrgsManual.length)
			});
		}
	}

	/**
	 * Manually pins an organization as a "Top Org"
	 */
	topOrgToggle(e, data){
		ThemeMethods.topOrgToggle.call({theme_id: this.props.theme._id, org_id: data.org}, () => {
			var newState = {calcNumTopOrgs: Math.max(this.props.theme.numTopOrgs, this.props.theme.topOrgsManual.length)};
			if(this.state[data.org]){
				newState[data.org] = false;
			} else {
				newState[data.org] = true;
			}
			this.setState(newState);
		});
	}

	render() {
		let orgs = this.sortTopOrgs();

		return (
			<React.Fragment>

				<h1>Top <NumTopOrgsInput size='mini' type='number' value={this.state.numTopOrgs} onChange={this.updateNumTopOrgs} width={1} /> Organizations</h1>

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
						let positive = i < this.state.calcNumTopOrgs;
						return(
							<Table.Row positive={positive} key={i}>
								<Table.Cell>{org.title}</Table.Cell>
								<Table.Cell>{ Number( parseFloat(org.votes).toFixed(1) ) }</Table.Cell>
								<Table.Cell><Checkbox toggle onChange={this.topOrgToggle} org={org._id} checked={this.state[org._id] || false} /></Table.Cell>
							</Table.Row>
						)
					})}
					</Table.Body>
				</Table>

			</React.Fragment>
		);
	}

	sortTopOrgs(){
		// First sort orgs by weight and vote count
		let sortedOrgs = _.sortBy(this.props.organizations, (org) => {
			let votes = org.chitVotes.count ? org.chitVotes.count :
										org.chitVotes.weight ? org.chitVotes.weight / this.props.theme.chit_weight : 0;

			// Save the votes count for later
			org.votes = votes;

			return -(votes)
		});

		//Then bubble up the manual top orgs
		if(this.state.calcNumTopOrgs >= this.props.theme.topOrgsManual.length){
			for(let i = sortedOrgs.length-1; i >= this.state.calcNumTopOrgs; i--){
				console.log({i: i, num: this.state.calcNumTopOrgs});
				// console.log({id: sortedOrgs[i]._id, index: i});
				if(this.state[sortedOrgs[i]._id]){
					// Find next auto top org
					let j = i-1;
					while(j > 0 && this.state[sortedOrgs[j]._id]){
						j--;
					}

					// Start swapping j down until it's below i
					while(j < i){
						let tmp = sortedOrgs[i];
						sortedOrgs[i] = sortedOrgs[j];
						sortedOrgs[j] = tmp;

						j++;
					}

					// Send the index back one in case we swapped another match into previous place
					i++;
				}
			}
		}

		return sortedOrgs;
	}
}

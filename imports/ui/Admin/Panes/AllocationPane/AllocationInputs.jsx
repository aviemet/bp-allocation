import React from 'react';
import _ from 'underscore';
import numeral from 'numeral';

import { OrganizationMethods, ThemeMethods } from '/imports/api/methods';

import { Table, Checkbox, Button, Form, Dropdown, Input, Label } from 'semantic-ui-react';

const actionOptions = [
	{ key: 'actions', text: 'Actions', value: 'actions' },
	{ key: 'topoff', text: 'Top Off', value: 'topff' },
	{ key: 'reset', text: 'Reset', value: 'reset' }
];

const CrowdFavoriteRibbon = (props) => {
	if(props.crowdFavorite === false){
		return <React.Fragment>{props.children}</React.Fragment>
	}
	return <Label ribbon color='green'>{props.children} - (Fav)</Label>
}

export default class AllocationInputs extends React.Component {
	constructor(props) {
		super(props);

		let save = props.theme.saves.find( save => save.org === props.org._id);

		this.state ={
			amount_from_votes: props.org.amount_from_votes,
			save: save ? save.amount : 0,
			percent: 0,
			funded: props.org.pledges
		}
	}

	componentDidUpdate = (prevProps, prevState) => {
		let org = this.props.org;
		let funded = parseInt(org.pledges || 0) + (org.amount_from_votes || 0) + (org.topoff || 0);
		let save = this.props.theme.saves.find( save => save.org === org._id);

		let newState = {
			amount_from_votes: org.amount_from_votes,
			funded: funded,
			percent: funded / org.ask,
			save: save ? save.amount : 0
		};

		let stateChange = false;
		Object.entries(newState).forEach(([key, val]) => {
			if(this.state.hasOwnProperty(key) && this.state[key] !== val) {
				stateChange = true;
			}
		});

		if(stateChange) {
			this.setState(newState);
		}
	}

	enterAmountFromVotes = (e, data) => {
		if(data.value !== this.state.amount_from_votes){
			OrganizationMethods.update.call({id: this.props.org._id, data: {
				amount_from_votes: data.value
			}});
			this.setState({amount_from_votes: data.value});
		}
	}

	pledge = (e, data) => {
		e.preventDefault();

		// Get the amount to pledge
		let amount = e.target.elements.valueInput.value;

		OrganizationMethods.pledge.call({
			id: this.props.org._id,
			amount: amount,
			match: true, // this.state.match,
			themeId: this.props.org.theme
		});

		// Clear the input
		e.target.elements.valueInput.value = '';
	}

	handleActionSelection = (e, data) => {
		switch(data.value){
			case actionOptions[1].value: // topoff
				OrganizationMethods.topoff.call({id: this.props.org._id});
				break;
			case actionOptions[2].value: // reset
				OrganizationMethods.reset.call({id: this.props.org._id});
				break;
		}
	}

	render() {
		const reachedGoal = this.state.funded >= this.props.org.ask;
		let topoff = this.props.org.topoff || 0;

		return (
			<Table.Row positive={reachedGoal}>

				{/* Org Title */}
				<Table.Cell>
					<CrowdFavoriteRibbon
						crowdFavorite={this.props.crowdFavorite || false}
					>
						{this.props.org.title}
					</CrowdFavoriteRibbon>
				</Table.Cell>

				{/* Voted Amount Input */}
				<Table.Cell>
					<Input
						fluid
						type='number'
						value={this.state.amount_from_votes}
						onChange={this.enterAmountFromVotes}
						tabIndex={this.props.tabInfo ? this.props.tabInfo.index : false}
					/>
				</Table.Cell>

				{/* Matched Pledges Input */}
				<Table.Cell>
					<Form onSubmit={this.pledge}>
						<Form.Input
							fluid
							type='text'
							name='valueInput'
							action='+'
							tabIndex={this.props.tabInfo ? this.props.tabInfo.index + this.props.tabInfo.length : false}
						/>
					</Form>
				</Table.Cell>

				{/* Funded */}
				<Table.Cell className={reachedGoal ? 'bold' : ''}>
					${numeral(this.state.funded + this.state.save).format('0,0')}
				</Table.Cell>

				{/* Ask */}
				<Table.Cell className={reachedGoal ? 'bold' : ''}>
					${numeral(this.props.org.ask).format('0,0')}
				</Table.Cell>

				{/* Need */}
				<Table.Cell>
					{numeral(this.props.org.ask - this.props.org.amount_from_votes - this.props.org.pledges - topoff - this.state.save).format('$0,0.00')}
				</Table.Cell>

				{/* Actions */}
				<Table.Cell singleLine>
					<Dropdown
						floating
						button
						text='Actions'
						options={actionOptions}
						onChange={this.handleActionSelection}
					/>
				</Table.Cell>
			</Table.Row>
		);
	}
}

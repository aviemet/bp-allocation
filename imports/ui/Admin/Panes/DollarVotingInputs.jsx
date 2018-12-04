import React from 'react';
import _ from 'underscore';
import numeral from 'numeral';

import { OrganizationMethods, ThemeMethods } from '/imports/api/methods';


import { Table, Checkbox, Button, Form, Dropdown, Input } from 'semantic-ui-react';

const actionOptions = [
	{ key: 'actions', text: 'Actions', value: 'actions' },
	{ key: 'topoff', text: 'Top Off', value: 'topff' },
	{ key: 'reset', text: 'Reset', value: 'reset' }
];

export default class DollarVotingInputs extends React.Component {
	constructor(props) {
		super(props);

		this.state ={
			subtract: false,
			match: this.props.match,
			amount_from_votes: this.props.org.amount_from_votes,
			percent: 0,
			funded: this.props.org.pledges
		}

		this.toggleMatch = this.toggleMatch.bind(this);
		this.toggleSubtract = this.toggleSubtract.bind(this);
		this.enterAmountFromVotes = this.enterAmountFromVotes.bind(this);
		this.pledge = this.pledge.bind(this);
		this.handleActionSelection = this.handleActionSelection.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		let newState = {};
		let org = this.props.org;

		let funded = parseInt(org.pledges || 0) + (org.amount_from_votes || 0) + (org.topoff || 0)
		let percent = funded / org.ask;

		// Listen for parent toggle switch for matching funds
		if(prevProps.match !== this.props.match)
			newState.match = this.props.match;

		if(prevState.amount_from_votes !== org.amount_from_votes)
			newState.amount_from_votes = org.amount_from_votes;

		if(this.state.percent !== percent)
			newState.percent = percent;

		if(this.state.funded !== funded)
			newState.funded = funded;


		// Update state if anything changed
		if(!_.isEmpty(newState))
			this.setState(newState);

	}

	toggleMatch() {
		this.setState({ match: !this.state.match });
	}

	toggleSubtract() {
		this.setState({subtract: true});
	}

	enterAmountFromVotes(e, data) {
		if(data.value !== this.state.amount_from_votes){
			OrganizationMethods.update.call({id: this.props.org._id, data: {
				amount_from_votes: data.value
			}});
			this.setState({amount_from_votes: data.value});
		}
	}

	pledge(e, data) {
		e.preventDefault();

		// Get the amount to pledge, positive or negative
		let amount = e.target.elements.valueInput.value;
		if(this.state.subtract){
			amount *= -1;
			this.setState({subtract: false});
		}

		OrganizationMethods.pledge.call({
			id: this.props.org._id,
			amount: amount,
			match: true, // this.state.match,
			themeId: this.props.org.theme
		});

		// Clear the input
		e.target.elements.valueInput.value = '';
	}

	handleActionSelection(e, data) {
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

		return (
			<Table.Row positive={reachedGoal}>
				<Table.Cell>{this.props.org.title}</Table.Cell>
				<Table.Cell>
					<Input type='number' value={this.state.amount_from_votes} onChange={this.enterAmountFromVotes} />
				</Table.Cell>
				<Table.Cell>
					<Form onSubmit={this.pledge}>
						<Form.Group>
							{/*<Form.Button onClick={this.toggleSubtract}>-</Form.Button>*/}
							<Form.Input type='text' name='valueInput' labelPosition='right'>
								<input />
								<Form.Button>+</Form.Button>
							</Form.Input>
						</Form.Group>
					</Form>
				</Table.Cell>
				{/*<Table.Cell>
					<Checkbox toggle checked={this.state.match} onClick={this.toggleMatch} />
				</Table.Cell>*/}
				<Table.Cell className={reachedGoal ? 'bold' : ''}>${numeral(this.state.funded).format('0,0')}</Table.Cell>
				<Table.Cell className={reachedGoal ? 'bold' : ''}>${numeral(this.props.org.ask).format('0,0')}</Table.Cell>
				<Table.Cell>{numeral(this.state.percent).format('0.00%')}</Table.Cell>
				<Table.Cell>
					<Dropdown text='Actions' floating button options={actionOptions} onChange={this.handleActionSelection} />
				</Table.Cell>
			</Table.Row>
		);
	}
}

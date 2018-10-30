import React from 'react';
import _ from 'underscore';
import numeral from 'numeral';

import { OrganizationMethods, ThemeMethods } from '/imports/api/methods';


import { Table, Checkbox, Button, Form, Dropdown } from 'semantic-ui-react';

const actionOptions = [
	{ key: 'topoff', text: 'Top Off', value: 'topff' },
	{ key: 'reset', text: 'Reset', value: 'reset' }
];

export default class DollarVotingInputs extends React.Component {
	constructor(props) {
		super(props);

		this.state ={
			subtract: false,
			match: this.props.match
		}

		this.toggleMatch = this.toggleMatch.bind(this);
		this.toggleSubtract = this.toggleSubtract.bind(this);
		this.pledge = this.pledge.bind(this);
		this.handleActionSelection = this.handleActionSelection.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		// Listen for parent toggle switch for matching funds
		if(prevProps.match !== this.props.match){
			this.setState({match: this.props.match});
		}
	}

	toggleMatch() {
		this.setState({ match: !this.state.match });
	}

	toggleSubtract() {
		this.setState({subtract: true});
	}

	pledge(e, data) {
		e.preventDefault();

		// Get the amount to pledge, positive or negative
		let amount = e.target.elements.valueInput.value;
		if(this.state.subtract){
			amount *= -1;
			this.setState({subtract: false});
		}

		OrganizationMethods.pledge.call({id: this.props.org._id, amount: amount, match: this.state.match, themeId: this.props.org.theme});

		// Clear the input
		e.target.elements.valueInput.value = '';
	}

	handleActionSelection(e, data) {
		switch(data.value){
			case actionOptions[0].value: // topoff
				OrganizationMethods.update.call({id: this.props.org._id, data: {
					value: this.props.org.ask
				}});
				break;
			case actionOptions[1].value: // reset
				OrganizationMethods.update.call({id: this.props.org._id, data: {
					value: 0
				}});
				break;
		}
	}

	render() {
		const reachedGoal = this.props.org.value >= this.props.org.ask;
		return (
			<Table.Row positive={reachedGoal}>
				<Table.Cell>{this.props.org.title}</Table.Cell>
				<Table.Cell>
					<Form onSubmit={this.pledge}>
						<Form.Group>
							<Form.Button onClick={this.toggleSubtract}>-</Form.Button>
							<Form.Input type='text' name='valueInput' />
							<Form.Button>+</Form.Button>
						</Form.Group>
					</Form>
				</Table.Cell>
				<Table.Cell><Checkbox toggle checked={this.state.match} onClick={this.toggleMatch} /></Table.Cell>
				<Table.Cell className={reachedGoal ? 'bold' : ''}>${numeral(this.props.org.value).format('0,0')}</Table.Cell>
				<Table.Cell className={reachedGoal ? 'bold' : ''}>${numeral(this.props.org.ask).format('0,0')}</Table.Cell>
				<Table.Cell>
					<Dropdown text='Actions' floating button options={actionOptions} onChange={this.handleActionSelection} />
				</Table.Cell>
			</Table.Row>
		);
	}
}

import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { withContext } from '/imports/ui/Contexts';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Loader, Button, Form, Input, Icon } from 'semantic-ui-react';

class SettingsPane extends React.Component {
	constructor(props) {
		super(props);

		this.usingFields = ['title', 'question', 'timer_length', 'chit_weight', 'match_ratio', 'leverage_total', 'consolation_amount', 'consolation_active'];

		let buildState = {};

		this.usingFields.map(field => buildState[field] = this.props.theme[field]);

		this.state = buildState;

		this.updateValue = this.updateValue.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	updateValue(e, el) {
		let newState = {};
		newState[el.name] = el.value || el.checked;
		this.setState(newState);
	}

	handleSubmit(e) {
		e.preventDefault();

		let dataChanged = false;
		for(var i = 0; i < this.usingFields.length && !dataChanged; i++){
			let field = this.usingFields[i];
			if(this.state[field] !== this.props.theme[field]) {
				dataChanged = true;
			}
		}

		// Only update if data has changed
		if(dataChanged) {

			ThemeMethods.update.call({
				id: this.props.theme._id,
				data: this.state
			}, (err, res) => {
				if(err){
					console.log(err);
				} else {
					console.log(res);
				}
			});
		}
	}

	render() {
		if(this.props.loading){
			return(<Loader/>)
		}
		return (
			<Form onBlur={this.handleSubmit} onSubmit={this.handleSubmit}>
				<Form.Field>
					<Form.Input type='text' placeholder='Title' label='Theme Title' name='title' value={this.state.title} onChange={this.updateValue}  />
				</Form.Field>

				<Form.Field>
					<Form.Input type='text' placeholder='Question' label='Theme Question' name='question' value={this.state.question} onChange={this.updateValue} />
				</Form.Field>

				<Form.Group>
			 		<Form.Input icon='dollar sign' iconPosition='left' label='Total Pot' name='leverage_total' placeholder='Total Pot' value={this.state.leverage_total} onChange={this.updateValue} />
				</Form.Group>

				<Form.Group>
					<Form.Input type='number' placeholder='Timer Length' label='Length of Timers' name='timer_length' value={this.state.timer_length} onChange={this.updateValue} />
					<Form.Input type='number' placeholder='Chit Weight' label='Chit weight in ounces' name='chit_weight' value={this.state.chit_weight} onChange={this.updateValue} />
					<Form.Input type='number' placeholder='Match Ratio' label='Multiplier for matched funds' name='match_ratio' value={this.state.match_ratio} onChange={this.updateValue} />
				</Form.Group>

				<Form.Group>
					<Form.Input type="number" placeholder='Consolation' label='Amount for bottom orgs' name='consolation_amount' value={this.state.consolation_amount} onChange={this.updateValue} />
					<Form.Checkbox toggle label='Use Consolation?' checked={this.state.consolation_active} name='consolation_active' onChange={this.updateValue} />
				</Form.Group>
			</Form>
		);
	}
}

export default withContext(SettingsPane);

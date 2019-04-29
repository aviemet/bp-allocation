import { Meteor } from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { withContext } from '/imports/api/Context';

import _ from 'lodash';

import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

import { Loader, Button, Form, Input, Icon } from 'semantic-ui-react';

class SettingsPane extends React.Component {
	constructor(props) {
		super(props);

		this.usingFields = [
			'theme.title',
			'theme.question',
			'theme.chitWeight',
			'theme.matchRatio',
			'theme.leverageTotal',
			'theme.consolationAmount',
			'theme.consolationActive',
			'presentationSettings.timerLength'
		];

		let buildState = {};

		this.usingFields.map(field => {
			let split = field.split('.');
			if(split.length > 1){
				buildState[field] = this.props[split[0]][split[1]];
			}
		});

		this.state = buildState;
	}

	// 2 way binding to inputs
	updateValue = (e, el) => {
		let newState = {};
		newState[el.name] = el.value || el.checked;
		this.setState(newState);
	}

	handleSubmit = (e) => {
		e.preventDefault();

		let data = {
			theme: {},
			presentationSettings: {}
		};

		// Build object of data which has changed
		for(var i = 0; i < this.usingFields.length; i++){
			let field = this.usingFields[i];
			if(this.state[field] !== this.props.theme[field]) {
				let split = field.split('.');
				if(split.length > 1) {
					data[split[0]][split[1]] = this.state[field];
				}
			}
		}

		// Only update if data has changed
		if(!_.isEmpty(data.theme)) {
			ThemeMethods.update.call({
				id: this.props.theme._id,
				data: data.theme
			});
		}

		if(!_.isEmpty(data.presentationSettings)) {
			PresentationSettingsMethods.update.call({
				id: this.props.theme.presentationSettings,
				data: data.presentationSettings
			});
		}
	}

	render() {
		if(this.props.loading){
			return(<Loader/>)
		}
		return (
			<Form onBlur={this.handleSubmit} onSubmit={this.handleSubmit}>

			 {/* Title */}
				<Form.Field>
					<Form.Input name='theme.title' type='text' placeholder='Title' label='Theme Title' value={this.state['theme.title'] || ''} onChange={this.updateValue}  />
				</Form.Field>

			 {/* Question */}
				<Form.Field>
					<Form.Input name='theme.question' type='text' placeholder='Question' label='Theme Question' value={this.state['theme.question'] || ''} onChange={this.updateValue} />
				</Form.Field>

			 {/* Total Leverage Amount */}
				<Form.Group>
			 		<Form.Input name='theme.leverageTotal' icon='dollar sign' iconPosition='left' label='Total Pot' placeholder='Total Pot' value={this.state['theme.leverageTotal'] || ''} onChange={this.updateValue} />
				</Form.Group>

				<Form.Group>
			 		{/* Timer Length */}
					<Form.Input name='presentationSettings.timerLength' type='number' placeholder='Timer Length' label='Length of Timers' value={this.state['presentationSettings.timerLength'] || ''} onChange={this.updateValue} />

			 		{/* Chit Weigh */}
					<Form.Input name='theme.chitWeight' type='number' placeholder='Chit Weight' label='Chit weight in ounces' value={this.state['theme.chitWeight'] || ''} onChange={this.updateValue} />

			 		{/* Match Ratio */}
					<Form.Input name='theme.matchRatio' type='number' placeholder='Match Ratio' label='Multiplier for matched funds' value={this.state['theme.matchRatio'] || ''} onChange={this.updateValue} />
				</Form.Group>

				<Form.Group>
			 		{/* Consolation Amount */}
					<Form.Input name='theme.consolationAmount' type="number" placeholder='Consolation' label='Amount for bottom orgs' value={this.state['theme.consolationAmount'] || ''} onChange={this.updateValue} />

			 		{/* Consolation Active */}
					<Form.Checkbox toggle name='theme.consolationActive' label='Use Consolation?' checked={this.state['theme.consolationActive']} onChange={this.updateValue} />
				</Form.Group>
			</Form>
		);
	}
}

export default withContext(SettingsPane);

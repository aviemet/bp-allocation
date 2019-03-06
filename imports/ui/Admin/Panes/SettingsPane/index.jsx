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

		this.state = {
			// loading: this.props.loading,
			themeId: this.props.themeId,
			title: this.props.theme.title,
			question: this.props.theme.question,
			timer_length: this.props.theme.timer_length,
			chit_weight: this.props.theme.chit_weight,
			match_ratio: this.props.theme.match_ratio,
			leverage_total: this.props.theme.leverage_total
		}

		this.updateValue = this.updateValue.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	// componentDidUpdate(prevProps, prevState){
	// 	if(!this.props.loading && this.state.loading){
	// 		this.setState({
	// 			loading: false,
	// 			title: this.props.theme.title,
	// 			question: this.props.theme.question,
	// 			timer_length: this.props.theme.timer_length,
	// 			chit_weight: this.props.theme.chit_weight,
	// 			match_ratio: this.props.theme.match_ratio,
	// 			leverage_total: this.props.theme.leverage_total
	// 		});
	// 	}
	// }

	updateValue(e) {
		let newState = {};
		newState[e.target.name] = e.target.value;
		this.setState(newState);
	}

	handleSubmit(e) {
		e.preventDefault();

		// Only update if data has changed
		if(this.state.title          !== this.props.theme.title ||
			 this.state.question       !== this.props.theme.question ||
			 this.state.timer_length   !== this.props.theme.timer_length ||
			 this.state.chit_weight    !== this.props.theme.chit_weight ||
			 this.state.match_ratio    !== this.props.theme.match_ratio ||
			 this.state.leverage_total !== this.props.theme.leverage_total) {

			ThemeMethods.update.call({id: this.state.themeId, data: {
				title: this.state.title,
				question: this.state.question,
				timer_length: this.state.timer_length,
				chit_weight: this.state.chit_weight,
				match_ratio: this.state.match_ratio,
				leverage_total: this.state.leverage_total
			}}, (err, res) => {
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
			</Form>
		);
	}
}

export default withContext(SettingsPane);

// export default withTracker(({themeId}) => {
// 	let themesHandle = Meteor.subscribe('themes');
//
// 	let theme = Themes.find({_id: themeId}).fetch()[0];
//
// 	return {
// 		theme: theme,
// 		loading: !themesHandle.ready()
// 	};
// })(SettingsPane);

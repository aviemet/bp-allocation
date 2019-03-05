import Meter from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'underscore';

import { Link } from 'react-router-dom';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Loader, Grid, Button, Icon, Label, Segment, Input, Checkbox } from 'semantic-ui-react';
import styled from 'styled-components';

import PresentationNavButton from '/imports/ui/Admin/Panes/PresentationNavButton';

const ButtonPanel = styled.div`
	&& button{
		width: 100%;
		height: 120px;
		margin-bottom: 10px;

		.icon{
			height: unset !important;
		}

		.label {
			font-size: 1.2rem;
		}
	}
`;

class PresentationPane extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			results_offset: this.props.theme.results_offset,
			timer_length: this.props.theme.timer_length
		};

		this.toggleThemeValue = this.toggleThemeValue.bind(this);
		this.updateThemeValue = this.updateThemeValue.bind(this);
		this.resetPresentation = this.resetPresentation.bind(this);
	}

	/**
	 * Togle boolean values on the Theme model
	 */
	toggleThemeValue(e, data){
		let tempData = {};
		tempData[data.index] = data.checked;

		ThemeMethods.update.call({id: this.props.themeId, data: tempData});
	}


	/**
	 * Update non-boolean values on the Theme model
	 */
	updateThemeValue(e, data){
		let tempData = {}
		tempData[data.index] = data.value;
		this.setState(tempData);
		// Wait a second in case there's multiple inputs
		// TODO: create queue to avoid multiple updates
		setTimeout(() => {
			ThemeMethods.update.call({id: this.props.themeId, data: tempData});
		}, 1000);
	}

	/**
	 * Reset the values for the presentation
	 */
	resetPresentation(){
		console.log('reset');
		ThemeMethods.update.call({id: this.props.themeId, data: {
			leverage_visible: false,
			animate_orgs: true,
		}});
	}

	render() {
		if(this.props.loading){
			return (
				<Loader />
			);
		}
		return (
			<ButtonPanel>
				<Grid columns='equal'>

					<Grid.Row stretched>
						<Grid.Column>

							{/************
							  * Intro/Title Page
							  ************/}
							<Segment>
								<PresentationNavButton page='intro'>
									<Icon name='address card' size='huge' /><br/>
									<Label>Title Page</Label>
								</PresentationNavButton>
							</Segment>

							{/************
							  * Top Organizations
							  ************/}
							<Segment>
								<PresentationNavButton page='toporgs'>
									<Icon name='winner' size='huge' /><br/>
									<Label>Top Organizations</Label>
								</PresentationNavButton>
								<Checkbox label='Animate' toggle index='animate_orgs' onClick={this.toggleThemeValue} checked={this.props.theme.animate_orgs || false} />
							</Segment>

						</Grid.Column>

						<Grid.Column>

							{/************
							  * Participating Organizations
							  ************/}
							<Segment>
								<PresentationNavButton page='orgs'>
									<Icon name='table' size='huge' /><br/>
									<Label>Participating Organizations</Label>
								</PresentationNavButton>
							</Segment>

							{/************
							  * Allocation/Evaluation
							  ************/}
							<Segment>
								<PresentationNavButton page='allocation'>
									<Icon name='chart bar' size='huge' /><br/>
									<Label>Allocation</Label>
								</PresentationNavButton>
								<Checkbox label='Show Leverage' toggle index='leverage_visible' onClick={this.toggleThemeValue} checked={this.props.theme.leverage_visible || false} />
							</Segment>

						</Grid.Column>

						<Grid.Column>

							{/************
							  * Timer
							  ************/}
							<Segment>
								<PresentationNavButton page='timer' icon>
									<Icon name='hourglass' size='huge' /><br/>
									<Label>Timer</Label>
								</PresentationNavButton>
								<Input type='number' label='Seconds' index='timer_length' onChange={this.updateThemeValue} value={this.state.timer_length} /><br/>
								<Checkbox label='Chit Voting Active' toggle index='chit_voting_active' onClick={this.toggleThemeValue} checked={this.props.theme.chit_voting_active || false} /><br/>
								<Checkbox label='Funds Voting Active' toggle index='funds_voting_active' onClick={this.toggleThemeValue} checked={this.props.theme.funds_voting_active || false} />
							</Segment>

							{/************
							  * Results Page
							  ************/}
							<Segment>
								<PresentationNavButton page='results'>
									<Icon name='check' size='huge' /><br/>
									<Label>Result</Label>
								</PresentationNavButton>
								<Input type='number' icon='dollar sign' iconPosition='left' label='Offset' labelPosition='right' index='results_offset' value={this.state.results_offset} onChange={this.updateThemeValue} />
							</Segment>

						</Grid.Column>
					</Grid.Row>

					<Grid.Row>
						<Grid.Column>

							<Link to={`/presentation/${this.props.themeId}`} target='_blank'>
								<PresentationNavButton page='intro'>
									<Label>Launch Presentaion</Label>
								</PresentationNavButton>
							</Link>

						</Grid.Column>
					</Grid.Row>

				</Grid>
			</ButtonPanel>
		);
	}
}

export default withTracker(({themeId}) => {
	let themesHandle = Meteor.subscribe('themes', themeId);

	theme = Themes.find({_id: themeId}).fetch()[0];

	return {
		loading: !themesHandle.ready(),
		theme: theme
	}
})(PresentationPane);


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
			resultsOffset: this.props.theme.results_offset,
			timerSeconds: this.props.theme.timer_length
		};

		this.toggleParticipatingOrgsAnimation = this.toggleParticipatingOrgsAnimation.bind(this);
		this.toggleTopOrgsAnimation = this.toggleTopOrgsAnimation.bind(this);
		this.toggleShowLeverage = this.toggleShowLeverage.bind(this);
		this.updateTimerSeconds = this.updateTimerSeconds.bind(this);
		this.updateResultsOffset = this.updateResultsOffset.bind(this);
		this.resetPresentation = this.resetPresentation.bind(this);
	}

	componentDidUpdate(prevProps, prevState){
		// var newState = {};
		// if(this.props.theme.timer_length !== prevState.timerSeconds){
		// 	newState.timerSeconds = this.props.theme.timer_length;
		// }
		// if(this.props.theme.results_offset !== prevState.resultsOffset){
		// 	newState.resultsOffset = this.props.theme.results_offset;
		// }
		// if(!_.isEmpty(newState)){
		// 	this.setState(newState);
		// }
	}

	toggleParticipatingOrgsAnimation(){

	}

	toggleTopOrgsAnimation(){

	}

	toggleShowLeverage(e, data){
		ThemeMethods.update.call({id: this.props.themeId, data: { leverage_visible: data.checked } });
	}

	updateTimerSeconds(e, data){
		this.setState({timerSeconds: data.value});
		setTimeout(() => {
			ThemeMethods.update.call({id: this.props.themeId, data: { timer_length: data.value}});
		}, 1000);
	}

	updateResultsOffset(e, data){
		this.setState({resultsOffset: data.value});
		setTimeout(() => {
			ThemeMethods.update.call({id: this.props.themeId, data: { results_offset: data.value}});
		}, 1000);
	}

	resetPresentation(){
		console.log('reset');
		ThemeMethods.update.call({id: this.props.themeId, data: { leverage_visible: false } });
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

					<Grid.Row>
						<Grid.Column>

							<Link to={`/presentation/${this.props.themeId}`} target='_blank'>
								<PresentationNavButton page='intro'>
									<Label>Launch Presentaion</Label>
								</PresentationNavButton>
							</Link>

						</Grid.Column>
					</Grid.Row>

					<Grid.Row stretched>
						<Grid.Column>

							<Segment>
								<PresentationNavButton page='intro'>
									<Icon name='address card' size='huge' /><br/>
									<Label>Title Page</Label>
								</PresentationNavButton>
							</Segment>

							<Segment>
								<PresentationNavButton page='toporgs'>
									<Icon name='winner' size='huge' /><br/>
									<Label>Top Organizations</Label>
								</PresentationNavButton>
								<Checkbox label='Animate' toggle onClick={this.toggleTopOrgsAnimation} />
							</Segment>

						</Grid.Column>

						<Grid.Column>

							<Segment>
								<PresentationNavButton page='orgs'>
									<Icon name='table' size='huge' /><br/>
									<Label>Participating Organizations</Label>
								</PresentationNavButton>
								{/*<Checkbox label='Animate' toggle onClick={this.toggleParticipatingOrgsAnimation} />*/}
							</Segment>

							<Segment>
								<PresentationNavButton page='allocation'>
									<Icon name='chart bar' size='huge' /><br/>
									<Label>Allocation</Label>
								</PresentationNavButton>
								<Checkbox label='Show Leverage' toggle onClick={this.toggleShowLeverage} checked={this.props.theme.leverage_visible || false} />
							</Segment>

						</Grid.Column>

						<Grid.Column>

							<Segment>
								<PresentationNavButton page='timer' icon>
									<Icon name='hourglass' size='huge' /><br/>
									<Label>Timer</Label>
								</PresentationNavButton>
								<Input type='number' label='Seconds' onChange={this.updateTimerSeconds} value={this.state.timerSeconds} />
							</Segment>

							<Segment>
								<PresentationNavButton page='results'>
									<Icon name='check' size='huge' /><br/>
									<Label>Result</Label>
								</PresentationNavButton>
								<Input type='number' icon='dollar sign' iconPosition='left' label='Offset' labelPosition='right' value={this.state.resultsOffset} onChange={this.updateResultsOffset} />
							</Segment>

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


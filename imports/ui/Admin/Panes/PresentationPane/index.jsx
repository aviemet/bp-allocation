import Meter from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'underscore';

import { Link } from 'react-router-dom';

import { withContext } from '/imports/ui/Contexts';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Loader, Grid, Button, Icon, Label, Segment, Input, Checkbox } from 'semantic-ui-react';
import styled from 'styled-components';

import PresentationNavButton from './PresentationNavButton';

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
	}

	/**
	 * Togle boolean values on the Theme model
	 */
	toggleThemeValue = (e, data) => {
		let tempData = {};
		tempData[data.index] = data.checked;

		ThemeMethods.update.call({id: this.props.themeId, data: tempData});
	}


	/**
	 * Update non-boolean values on the Theme model
	 */
	updateThemeValue = (e, data) => {
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
	resetPresentation = () => {
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
					<Grid celled columns={3}>
						<Grid.Row>
							<Grid.Column>

							{/************
							  * Intro/Title Page
							  ************/}
								<PresentationNavButton page='intro'>
									<Icon name='address card' size='huge' /><br/>
									<Label>Title Page</Label>
								</PresentationNavButton>

							</Grid.Column>
							<Grid.Column>

							{/************
							  * Participating Organizations
							  ************/}
								<PresentationNavButton page='orgs'>
									<Icon name='table' size='huge' /><br/>
									<Label>Participating Organizations</Label>
								</PresentationNavButton>

							</Grid.Column>
							<Grid.Column>

							{/************
							  * Timer
							  ************/}
								<PresentationNavButton page='timer' icon>
									<Icon name='hourglass' size='huge' /><br/>
									<Label>Timer</Label>
								</PresentationNavButton>
								<Input type='number' label='Seconds' index='timer_length' onChange={this.updateThemeValue} value={this.state.timer_length} />
								<br/>
								<Checkbox label='Chit Voting Active' toggle index='chit_voting_active' onClick={this.toggleThemeValue} checked={this.props.theme.chit_voting_active || false} />
								<br/>
								<Checkbox label='Funds Voting Active' toggle index='funds_voting_active' onClick={this.toggleThemeValue} checked={this.props.theme.funds_voting_active || false} />

							</Grid.Column>

						</Grid.Row>
						<Grid.Row>
							<Grid.Column>

							{/************
							  * Top Organizations
							  ************/}
								<PresentationNavButton page='toporgs'>
									<Icon name='winner' size='huge' /><br/>
									<Label>Top Organizations</Label>
								</PresentationNavButton>
								<Checkbox label='Animate' toggle index='animate_orgs' onClick={this.toggleThemeValue} checked={this.props.theme.animate_orgs || false} />

							</Grid.Column>
							<Grid.Column>

							{/************
							  * Allocation/Evaluation
							  ************/}
								<PresentationNavButton page='allocation'>
									<Icon name='chart bar' size='huge' /><br/>
									<Label>Allocation</Label>
								</PresentationNavButton>
								<Checkbox label='Show Leverage' toggle index='leverage_visible' onClick={this.toggleThemeValue} checked={this.props.theme.leverage_visible || false} />
								<br/>
								<Checkbox label='Show Save Vales' toggle index='saves_visible' onClick={this.toggleThemeValue} checked={this.props.theme.saves_visible || false} />

							</Grid.Column>
							<Grid.Column>

							{/************
							  * Results Page
							  ************/}
								<PresentationNavButton page='results'>
									<Icon name='check' size='huge' /><br/>
									<Label>Result</Label>
								</PresentationNavButton>
								<Input type='number' icon='dollar sign' iconPosition='left' label='Offset' labelPosition='right' index='results_offset' value={this.state.results_offset} onChange={this.updateThemeValue} />

							</Grid.Column>
						</Grid.Row>
					</Grid>

				<Segment>
					<Grid columns={1}>
						<Grid.Row>
							<Grid.Column>

								<Link to={`/presentation/${this.props.theme._id}`} target='_blank'>
									<PresentationNavButton page='intro'>
										<Label>Launch Presentaion</Label>
									</PresentationNavButton>
								</Link>

							</Grid.Column>
						</Grid.Row>
					</Grid>
				</Segment>

			</ButtonPanel>
		);
	}
}

export default withContext(PresentationPane);

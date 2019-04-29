import Meter from 'meteor/meteor';
import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { Link } from 'react-router-dom';

import { withContext } from '/imports/api/Context';

import { Themes } from '/imports/api';
import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

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
			resultsOffset: this.props.presentationSettings.resultsOffset,
			timerLength: this.props.presentationSettings.timerLength
		};
	}

	/**
	 * Togle boolean values on the PresentationSettings model
	 */
	togglePresentationSettingsValue = (e, data) => {
		let tempData = {};
		tempData[data.index] = data.checked;

		PresentationSettingsMethods.update.call({id: this.props.theme.presentationSettings, data: tempData});
	}


	/**
	 * Update non-boolean values on the PresentationSettings model
	 */
	updatePresentationSettingsValue = (e, data) => {
		let tempData = {}
		tempData[data.index] = data.value;
		this.setState(tempData);

		// TODO: create queue to avoid multiple updates
		PresentationSettingsMethods.update.call({
			id: this.props.theme.presentationSettings,
			data: tempData
		});
	}

	/**
	 * Reset the values for the presentation
	 */
	resetPresentation = () => {
		PresentationSettingsMethods.update.call({id: this.props.theme.presentationSettings, data: {
			leverageVisible: false,
			animateOrgs: true,
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
								<Checkbox label='Colorize Top Orgs' toggle index='colorizeOrgs' onClick={this.togglePresentationSettingsValue} checked={this.props.presentationSettings.colorizeOrgs || false} />

							</Grid.Column>
							<Grid.Column>

							{/************
							  * Timer
							  ************/}
								<PresentationNavButton page='timer' icon>
									<Icon name='hourglass' size='huge' /><br/>
									<Label>Timer</Label>
								</PresentationNavButton>
								<Input type='number' label='Seconds' index='timerLength' onChange={this.updatePresentationSettingsValue} value={this.state.timerLength} />
								<br/>
								<Checkbox label='Chit Voting Active' toggle index='chitVotingActive' onClick={this.togglePresentationSettingsValue} checked={this.props.presentationSettings.chitVotingActive || false} />
								<br/>
								<Checkbox label='Funds Voting Active' toggle index='fundsVotingActive' onClick={this.togglePresentationSettingsValue} checked={this.props.presentationSettings.fundsVotingActive || false} />

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
								<Checkbox label='Animate' toggle index='animateOrgs' onClick={this.togglePresentationSettingsValue} checked={this.props.presentationSettings.animateOrgs || false} />

							</Grid.Column>
							<Grid.Column>

							{/************
							  * Allocation/Evaluation
							  ************/}
								<PresentationNavButton page='allocation'>
									<Icon name='chart bar' size='huge' /><br/>
									<Label>Allocation</Label>
								</PresentationNavButton>
								<Checkbox label='Show Leverage' toggle index='leverageVisible' onClick={this.togglePresentationSettingsValue} checked={this.props.presentationSettings.leverageVisible || false} />
								<br/>
								<Checkbox label='Show Save Values' toggle index='savesVisible' onClick={this.togglePresentationSettingsValue} checked={this.props.presentationSettings.savesVisible || false} />

							</Grid.Column>
							<Grid.Column>

							{/************
							  * Results Page
							  ************/}
								<PresentationNavButton page='results'>
									<Icon name='check' size='huge' /><br/>
									<Label>Result</Label>
								</PresentationNavButton>
								<Input type='number' icon='dollar sign' iconPosition='left' label='Offset' labelPosition='right' index='resultsOffset' value={this.state.resultsOffset} onChange={this.updatePresentationSettingsValue} />

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

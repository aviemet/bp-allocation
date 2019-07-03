import React, { useState, useContext, useEffect } from 'react';
import _ from 'lodash';

import { Link } from 'react-router-dom';

import { ThemeContext, PresentationSettingsContext } from '/imports/context';
import { PresentationSettingsMethods } from '/imports/api/methods';

import { Grid, Icon, Label, Segment, Input } from 'semantic-ui-react';
import styled from 'styled-components';

import { ChitVotingActiveToggle, FundsVotingActiveToggle, ColorizeTopOrgsToggle, AnimateTopOrgsToggle, ShowLeverageToggle, ShowSaveValuesToggle } from '/imports/ui/Components/Toggles';

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

const PresentationPane = () => {

	const { theme } = useContext(ThemeContext);
	const { settings } = useContext(PresentationSettingsContext);

	const [ resultsOffset, setResultsOffset ] = useState(settings.resultsOffset);
	const [ timerLength, setTimerLength ] = useState(settings.timerLength);

	useEffect(() => {
		let data = {};
		if(resultsOffset !== settings.resultsOffset) {
			data.resultsOffset = resultsOffset;
		}

		if(timerLength !== settings.timerLength) {
			data.timerLength = timerLength;
		}

		if(!_.isEmpty(data)){
			PresentationSettingsMethods.update.call({
				id: theme.presentationSettings,
				data: data
			});
		}
	});

	/**
	 * Reset the values for the presentation
	 */
	/*const resetPresentation = () => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				leverageVisible: false,
				animateOrgs: true,
			}
		});
	};*/

	return (
		<ButtonPanel>
			<Grid celled columns={ 3 }>
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
						<ColorizeTopOrgsToggle />

					</Grid.Column>
					<Grid.Column>

						{/************
					  * Timer
					  ************/}
						<PresentationNavButton page='timer' icon>
							<Icon name='hourglass' size='huge' /><br/>
							<Label>Timer</Label>
						</PresentationNavButton>
						<Input
							type='number'
							label='Seconds'
							index='timerLength'
							value={ timerLength }
							onChange={ e => setTimerLength(parseInt(e.target.value)) }
						/>
						<br/>
						<ChitVotingActiveToggle />
						<br/>
						<FundsVotingActiveToggle />

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
						<AnimateTopOrgsToggle />

					</Grid.Column>
					<Grid.Column>

						{/************
					  * Allocation/Evaluation
					  ************/}
						<PresentationNavButton page='allocation'>
							<Icon name='chart bar' size='huge' /><br/>
							<Label>Allocation</Label>
						</PresentationNavButton>
						<ShowLeverageToggle />
						<br/>
						<ShowSaveValuesToggle />

					</Grid.Column>
					<Grid.Column>

						{/************
					  * Results Page
					  ************/}
						<PresentationNavButton page='results'>
							<Icon name='check' size='huge' /><br/>
							<Label>Result</Label>
						</PresentationNavButton>
						<Input
							type='number'
							icon='dollar sign'
							iconPosition='left'
							label='Offset'
							labelPosition='right'
							index='resultsOffset'
							value={ resultsOffset }
							onChange={ e => setResultsOffset(parseFloat(e.target.value)) }
						/>

					</Grid.Column>
				</Grid.Row>
			</Grid>

			<Segment>
				<Grid columns={ 1 }>
					<Grid.Row>
						<Grid.Column>

							<Link to={ `/presentation/${theme._id}` } target='_blank'>
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
};

export default PresentationPane;

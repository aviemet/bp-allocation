import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import { Link } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useTheme, useSettings } from '/imports/api/providers';
import { PresentationSettingsMethods } from '/imports/api/methods';

import { Grid, Icon, Label, Segment, Input, Button, Responsive, Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import { 
	ChitVotingActiveToggle, 
	FundsVotingActiveToggle, 
	ColorizeTopOrgsToggle, 
	AnimateTopOrgsToggle, 
	ShowLeverageToggle, 
	ShowSaveValuesToggle 
} from '/imports/ui/Components/Toggles';
import TextMembersButton from '/imports/ui/Components/TextMembersButton';

import PresentationNavButton from './PresentationNavButton';

const PresentationPane = observer(() => {
	const { theme } = useTheme();
	const { settings, isLoading: settingsLoading } = useSettings();

	const [ resultsOffset, setResultsOffset ] = useState(settings.resultsOffset);
	const [ timerLength, setTimerLength ] = useState(settings.timerLength);
	const [ gridColumns, setGridColumns ] = useState(3);

	useEffect(() => {
		if(!settingsLoading) {
			// TODO: Deferred loading is causing this to throw an error
			setResultsOffset(settings.resultsOffset);
			setTimerLength(settings.timerLength);

			/*let data = {};
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
			}*/
		}
	}, [settingsLoading]);

	const handleOnUpdate = (e, { width }) => {
		if(width > Responsive.onlyTablet.minWidth) {
			setGridColumns(3);
		} else {
			setGridColumns(1);
		}
	};

	/**
	 * Reset the values for the presentation
	 */
	const restoreDefaultSettings = () => {
		// Reset Presentation Settings
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				currentPage: 'intro',
				animateOrgs: true,
				leverageVisible: false,
				savesVisible: false,
				colorizeOrgs: false,
				resultsVisited: false,
				resultsOffset: 0,
			}
		});

	};

	const setResultsHaveBeenViewed = () => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				resultsVisited: true
			}
		});
	};

	if(settingsLoading) return <Loader active />;

	return (
		<ButtonPanel>
			<Responsive 
				as={ Grid } 
				celled 
				columns={ gridColumns }
				fireOnMount
				onUpdate={ handleOnUpdate }
			>
				<Grid.Row>
					<Grid.Column>

						{/************
					  * Intro/Title Page
					  ************/}
						<PresentationNavButton page='intro'>
							<Icon name='address card' size='huge' /><br/>
							<Label>Title Page</Label>
						</PresentationNavButton>

						<Button onClick={ restoreDefaultSettings }>Restore Defaults</Button>

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
						<TextMembersButton 
							style={ { float: 'right' } }
							title='Text: Begin Voting'
							// eslint-disable-next-line quotes
							message={ "From Battery Powered:\nWe have narrowed " + theme.organizations.length + " finalists down to " + theme.numTopOrgs + ". Use this link to vote your funds for the orgs you want to support:" }
						/>
						<TextMembersButton 
							style={ { float: 'right' } }
							title='Text: Voting Complete'
							// eslint-disable-next-line quotes
							message={ "From Battery Powered:\nThe results of voting are in! Check them out here:" }
						/>

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
						<PresentationNavButton page='results' onClick={ setResultsHaveBeenViewed }>
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
			</Responsive>

			<Responsive as={ Segment } minWidth={ Responsive.onlyTablet.minWidth }>
				<Grid columns={ 1 }>
					<Grid.Row>
						<Grid.Column>

							<Link to={ `/presentation/${theme._id}` } target='_blank'>
								<PresentationNavButton page='intro' active={ false }>
									<Label>Launch Presentaion</Label>
								</PresentationNavButton>
							</Link>

						</Grid.Column>
					</Grid.Row>
				</Grid>
			</Responsive>

		</ButtonPanel>
	);
});

const ButtonPanel = styled.div`
`;

export default PresentationPane;

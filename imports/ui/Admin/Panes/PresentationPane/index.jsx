import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useTheme, useSettings } from '/imports/api/providers';
import { PresentationSettingsMethods } from '/imports/api/methods';

import { TimerInput, ResultsOffsetInput } from '/imports/ui/Components/Inputs';
import { Grid, Icon, Label, Segment, Button, Responsive, Loader } from 'semantic-ui-react';
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

	const [ gridColumns, setGridColumns ] = useState(3);

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
				fundsVotingActive: false,
				chitVotingActive: false,
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

						<TimerInput timerLength={ settings.timerLength } settingsId={ settings._id } />
						<br/>
						<ChitVotingActiveToggle />
						<br/>
						<FundsVotingActiveToggle />
						<br/>
						<TextMembersButton 
							style={ { float: 'right' } }
							title='Text: Begin Voting'
							// eslint-disable-next-line quotes
							message={ "From Battery Powered:\nWe have narrowed " + theme.organizations.length + " finalists down to " + theme.numTopOrgs + ". Use this link to vote your funds for the orgs you want to support:" }
						/>
						<TextMembersButton 
							style={ { float: 'right' } }
							title='Text: 5 Minute Warning'
							// eslint-disable-next-line quotes
							message={ "From Battery Powered:\nVoting is closing in 5 minutes!  Vote here:" }
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
						
						<ResultsOffsetInput resultsOffset={ settings.resultsOffset } settingsId={ settings._id } />

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

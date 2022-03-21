import React from 'react'

import { Link } from 'react-router-dom'

import { observer } from 'mobx-react-lite'
import { useTheme, useSettings } from '/imports/api/providers'
import { PresentationSettingsMethods } from '/imports/api/methods'

import { TimerInput, ResultsOffsetInput } from '/imports/ui/Components/Inputs'
import {
	Button,
	Grid,
	Paper,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import ViewComfyIcon from '@mui/icons-material/ViewComfy'
import TimerIcon from '@mui/icons-material/Timer'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import BarChartIcon from '@mui/icons-material/BarChart'
import CheckIcon from '@mui/icons-material/Check'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import {
	ChitVotingActiveToggle,
	FundsVotingActiveToggle,
	TopupsActiveToggle,
	ColorizeTopOrgsToggle,
	AnimateTopOrgsToggle,
	ShowLeverageToggle,
	ShowSaveValuesToggle
} from '/imports/ui/Components/Toggles'

import PresentationNavButton from './PresentationNavButton'
import { Loading } from '/imports/ui/Components'

const PresentationPane = observer(() => {
	const { theme } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()

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
		})

	}

	const setResultsHaveBeenViewed = () => {
		PresentationSettingsMethods.update.call({
			id: settings._id,
			data: {
				resultsVisited: true
			}
		})
	}

	if(settingsLoading) return <Loading />

	return (
		<>
			<Paper sx={ { p: 3, mb: 2 } }>
				<Grid container spacing={ 2 }>
					<Grid item xs={ 12 } md={ 4 }>

						{/************
							* Intro/Title Page
							************/}
						<PresentationNavButton
							page='intro'
							label="Title Page"
							Icon={ InfoIcon }
						/>

						<Button onClick={ restoreDefaultSettings }>Restore Defaults</Button>
					</Grid>
					<Grid item xs={ 12 } md={ 4 }>

						{/************
							* Participating Organizations
							************/}
						<PresentationNavButton
							page='orgs'
							label="Participating Organizations"
							Icon={ ViewComfyIcon }
						/>

						<ColorizeTopOrgsToggle />

					</Grid>
					<Grid item xs={ 12 } md={ 4 }>

						{/************
							* Timer
							************/}
						<PresentationNavButton
							page='timer'
							label="Timer"
							Icon={ TimerIcon }
						/>

						<TimerInput timerLength={ settings.timerLength } settingsId={ settings._id } />
						<br/>
						<ChitVotingActiveToggle />
						<br/>
						<FundsVotingActiveToggle />

					</Grid>
					<Grid item xs={ 12 } md={ 4 }>

						{/************
							* Top Organizations
							************/}
						<PresentationNavButton
							page='toporgs'
							label="Top Organizations"
							Icon={ EmojiEventsIcon }
						/>

						<AnimateTopOrgsToggle />

					</Grid>
					<Grid item xs={ 12 } md={ 4 }>

						{/************
							* Allocation/Evaluation
							************/}
						<PresentationNavButton
							page='allocation'
							label="Allocation"
							Icon={ BarChartIcon }
						/>

						<ShowLeverageToggle />
						<br/>
						<ShowSaveValuesToggle />
						<br/>
						<hr />
						<TopupsActiveToggle />

					</Grid>
					<Grid item xs={ 12 } md={ 4 }>

						{/************
							* Results Page
							************/}
						<PresentationNavButton
							page='results'
							label="Results"
							Icon={ CheckIcon }
							onClick={ setResultsHaveBeenViewed }
						/>

						<ResultsOffsetInput resultsOffset={ settings.resultsOffset } settingsId={ settings._id } />


					</Grid>
				</Grid>
			</Paper>

			<Link to={ `/presentation/${theme._id}` } target='_blank'>
				<PresentationNavButton page='intro' label="Launch Presentaion" Icon={ OpenInNewIcon } active={ false } />
			</Link>

		</>
	)
})

export default PresentationPane

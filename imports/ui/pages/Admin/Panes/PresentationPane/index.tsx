// import { useTheme, useSettings } from "/imports/api/hooks"
import { PresentationSettingsMethods } from "/imports/api/methods"

import { TimerInput, ResultsOffsetInput } from "/imports/ui/components/Inputs"
import BarChartIcon from "@mui/icons-material/BarChart"
import CheckIcon from "@mui/icons-material/Check"
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"
import InfoIcon from "@mui/icons-material/Info"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import TimerIcon from "@mui/icons-material/Timer"
import ViewComfyIcon from "@mui/icons-material/ViewComfy"
import {
	Button,
	Container,
	Grid,
	Paper,
} from "@mui/material"

import {
	ChitVotingActiveToggle,
	FundsVotingActiveToggle,
	TopupsActiveToggle,
	ColorizeTopOrgsToggle,
	AnimateTopOrgsToggle,
	ShowLeverageToggle,
	ShowSaveValuesToggle,
} from "/imports/ui/components/Toggles"

import PresentationNavButton from "./PresentationNavButton"
import { Link, Loading } from "/imports/ui/components"
import { useSettings, useTheme } from "/imports/api/hooks"

const PresentationPane = () => {
	const { theme, themeLoading } = useTheme()
	const { settings, settingsLoading } = useSettings()

	if(themeLoading || !theme) return <Loading />
	/**
	 * Reset the values for the presentation
	 */
	const restoreDefaultSettings = async () => {
		if(!settings) return
		await PresentationSettingsMethods.update.callAsync({
			id: settings._id,
			data: {
				currentPage: "intro",
				fundsVotingActive: false,
				chitVotingActive: false,
				topupsActive: false,
				animateOrgs: true,
				leverageVisible: false,
				savesVisible: false,
				colorizeOrgs: false,
				resultsVisited: false,
				resultsOffset: 0,
				timerLength: 600,
			},
		})
	}

	const setResultsHaveBeenViewed = async () => {
		if(!settings) return
		await PresentationSettingsMethods.update.callAsync({
			id: settings._id,
			data: {
				resultsVisited: true,
			},
		})
	}

	if(settingsLoading || !settings) return <Loading />

	return (
		<Container>
			<Paper sx={ { p: 3, mb: 2 } }>
				<Grid container spacing={ 2 }>
					<Grid size={ { xs: 12, md: 4 } }>

						{ /************
							* Intro/Title Page
							************/ }
						<PresentationNavButton
							page="intro"
							label="Title Page"
							Icon={ InfoIcon }
						/>

						<Button onClick={ restoreDefaultSettings }>Restore Defaults</Button>
					</Grid>
					<Grid size={ { xs: 12, md: 4 } }>

						{ /************
							* Participating Organizations
							************/ }
						<PresentationNavButton
							page="orgs"
							label="Participating Organizations"
							Icon={ ViewComfyIcon }
						/>

						<ColorizeTopOrgsToggle />

					</Grid>
					<Grid size={ { xs: 12, md: 4 } }>

						{ /************
							* Timer
							************/ }
						<PresentationNavButton
							page="timer"
							label="Timer"
							Icon={ TimerIcon }
						/>

						<TimerInput timerLength={ Number(settings?.timerLength ?? 0) } settingsId={ String(settings?._id ?? "") } />
						<br/>
						<ChitVotingActiveToggle />
						<br/>
						<FundsVotingActiveToggle />

					</Grid>
					<Grid size={ { xs: 12, md: 4 } }>

						{ /************
							* Top Organizations
							************/ }
						<PresentationNavButton
							page="toporgs"
							label="Top Organizations"
							Icon={ EmojiEventsIcon }
						/>

						<AnimateTopOrgsToggle />

					</Grid>
					<Grid size={ { xs: 12, md: 4 } }>

						{ /************
							* Allocation/Evaluation
							************/ }
						<PresentationNavButton
							page="allocation"
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
					<Grid size={ { xs: 12, md: 4 } }>

						{ /************
							* Results Page
							************/ }
						<PresentationNavButton
							page="results"
							label="Results"
							Icon={ CheckIcon }
							onClick={ setResultsHaveBeenViewed }
						/>

						<ResultsOffsetInput resultsOffset={ Number(settings?.resultsOffset ?? 0) } settingsId={ String(settings?._id ?? "") } />


					</Grid>
				</Grid>
			</Paper>

			<Link to="/presentation/$id" params={ { id: theme._id } } target="_blank">
				<PresentationNavButton page="intro" label="Launch Presentation" Icon={ OpenInNewIcon } active={ false } />
			</Link>

		</Container>
	)
}

export default PresentationPane

import {
	Box,
	Grid,
	Stack,
	Typography,
	TextField,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useSettings, useTheme, useOrgs } from "/imports/api/providers"
import { ThemeMethods } from "/imports/api/methods"


import ManualInputTable from "./ManualInputTable"
import RankedOrgsTable from "./RankedOrgsTable"
import ChitVotingActiveToggle from "/imports/ui/components/Toggles/ChitVotingActiveToggle"
import { Loading } from "/imports/ui/components"

interface ChitVotingPaneProps {
	hideAdminFields?: boolean
}

const ChitVotingPane = observer(({ hideAdminFields }: ChitVotingPaneProps) => {
	const { settings, isLoading: settingsLoading } = useSettings()
	const { isLoading: orgsLoading } = useOrgs()
	const { theme } = useTheme()


	const updateNumTopOrgs = async e => {
		if(e.target.value !== theme.numTopOrgs) {
			await ThemeMethods.update.callAsync({
				id: theme._id,
				data: {
					numTopOrgs: e.target.value,
				},
			})
		}
	}

	if(orgsLoading || settingsLoading) return <Loading />

	return (
		<Grid container spacing={ 2 }>

			{ !settings?.useKioskChitVoting && <Grid size={ { xs: 12, md: 6 } }>
				<ManualInputTable />
			</Grid> }

			<Grid size={ { xs: 12, md: settings?.useKioskChitVoting ? 12 : 6 } }>
				<Box sx={ { mb: 2 } }>
					<Stack direction="row" justifyContent="space-between" alignItems="center">
						<Typography component="h3" variant="h3">
							Top { !hideAdminFields ?
								<TextField
									size="mini"
									type="number"
									value={ theme.numTopOrgs }
									onChange={ updateNumTopOrgs }
									width={ 1 }
								/> :
								theme.numTopOrgs
							} Organizations
						</Typography>

						<Typography component="h3" variant="h3">
							<ChitVotingActiveToggle />
						</Typography>
					</Stack>
				</Box>
				<RankedOrgsTable />
			</Grid>

		</Grid>
	)
})

export default ChitVotingPane

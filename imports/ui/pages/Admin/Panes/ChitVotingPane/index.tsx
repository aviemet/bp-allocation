import {
	Box,
	Grid,
	Stack,
	Typography,
	TextField,
	Container,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import { useSettings, useTheme, useOrgs } from "/imports/api/providers"
import { ThemeMethods } from "/imports/api/methods"
import React from "react"

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

	if(orgsLoading || settingsLoading || !theme) return <Loading />

	const updateNumTopOrgs = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(e.target.value, 10)
		if(newValue !== theme.numTopOrgs) {
			await ThemeMethods.update.callAsync({
				id: theme._id,
				data: {
					numTopOrgs: newValue,
				},
			})
		}
	}

	return (
		<Container>
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
										size="small"
										type="number"
										value={ theme.numTopOrgs }
										onChange={ updateNumTopOrgs }
										sx={ { width: "4em" } }
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
		</Container>
	)
})

export default ChitVotingPane

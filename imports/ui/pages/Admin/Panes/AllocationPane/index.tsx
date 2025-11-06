import {
	Button,
	Grid,
	Typography,
} from "@mui/material"
import { Link } from "@tanstack/react-router"
import { observer } from "mobx-react-lite"
import { useState, useEffect } from "react"
import { Loading } from "/imports/ui/components"

import AllocationsTable from "./AllocationsTable"
import Breakdown from "./Breakdown"

import { ShowLeverageToggle } from "/imports/ui/components/Toggles"
import { useTheme, useOrgs } from "/imports/api/providers"

interface AllocationPaneProps {
	hideAdminFields?: boolean
}

const AllocationPane = observer(({ hideAdminFields = false }: AllocationPaneProps) => {
	const { theme, isLoading: themeLoading } = useTheme()
	const { topOrgs, isLoading: orgsLoading } = useOrgs()

	if(themeLoading || orgsLoading) return <Loading />

	return (
		<Grid container spacing={ 2 }>

			{ /* Breakdown Segment */ }
			<Grid size={ { xs: 12 } }>
				<Breakdown />
			</Grid>

			<Grid size={ { xs: 8 } }>
				<Typography component="h2" variant="h2">Top { topOrgs.length } Funds Allocation</Typography>
			</Grid>

			{ !hideAdminFields && <>
				<Grid size={ { xs: 2 } } sx={ { textAlign: "right" } }>
					<Link to={ `/simulation/${theme._id}` } target="_blank">
						<Button>Simulate</Button>
					</Link>
				</Grid>

				<Grid size={ { xs: 2 } }>
					<ShowLeverageToggle />
				</Grid>
			</> }

			<Grid size={ { xs: 12 } }>
				<AllocationsTable hideAdminFields={ hideAdminFields } />
			</Grid>
		</Grid>
	)
})

export default AllocationPane

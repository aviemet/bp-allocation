import {
	Typography,
} from "@mui/material"
import { useMemo } from "react"
import { useTheme, useOrgs } from "/imports/api/hooks"

import { Loading } from "/imports/ui/components"
import { OrgCard, OrgCardContainer } from "/imports/ui/components/Cards"
import { useWindowSize, breakpoints } from "/imports/ui/MediaProvider"

const KioskInfo = () => {
	const { theme } = useTheme()
	const { orgs, topOrgs, orgsLoading } = useOrgs()

	const { width } = useWindowSize()

	const itemsPerRow = useMemo(() => {
		if(width && width < breakpoints.tablet) {
			return 1
		}
		if(width && width >= breakpoints.tablet && width < breakpoints.tabletL) {
			return 2
		}
		return 3
	}, [width])

	if(orgsLoading || !theme || !orgs) return <Loading />

	const title = theme.chitVotingStarted ?
		`TOP ${theme.numTopOrgs} ORGANIZATIONS` :
		"ORGANIZATIONS THIS THEME"

	let subHeading = ""
	if(!theme.chitVotingStarted && !theme.fundsVotingStarted) {
		subHeading = "Round 1 Voting To Begin Shortly"
	} else if(theme.chitVotingStarted && !theme.fundsVotingStarted) {
		subHeading = "Round 2 Voting To Begin Shortly"
	} else {
		subHeading = "Votes Are In, Results Coming Soon"
	}

	const orgsToDisplay = theme.chitVotingStarted ? topOrgs : orgs
	return (
		<>
			<Typography component="h1" variant="h3" align="center">{ title }</Typography>
			<Typography component="h2" variant="h4" align="center">{ subHeading }</Typography>
			<OrgCardContainer cols={ itemsPerRow } sx={ {
				"& > .MuiBox-root": {
					height: 250,
				},
			} }>
				{ orgsToDisplay.map(org => (
					<OrgCard
						key={ org._id }
						org={ org }
						info={ true }
					/>
				)) }
			</OrgCardContainer>
		</>
	)
}

export default KioskInfo

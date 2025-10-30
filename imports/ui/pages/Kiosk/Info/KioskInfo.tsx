import styled from "@emotion/styled"
import {
	Box,
	Button,
	Container,
	Grid,
	InputAdornment,
	Stack,
	Switch,
	OutlinedInput,
	Typography,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTheme, useOrgs } from "/imports/api/providers"

import { Loading } from "/imports/ui/components"
import { OrgCard, OrgCardContainer } from "/imports/ui/components/Cards"
import { useWindowSize, breakpoints } from "/imports/ui/MediaProvider"

const KioskInfo = observer(() => {
	const { theme } = useTheme()
	const { orgs, topOrgs, isLoading: orgsLoading } = useOrgs()

	const [ itemsPerRow, setItemsPerRow ] = useState(3)

	const { width } = useWindowSize()

	useEffect(() => {
		let n = itemsPerRow
		if(width < breakpoints.tablet) {
			n = 1
		} else if(width >= breakpoints.tablet && width < breakpoints.tabletL) {
			n = 2
		} else {
			n = 3
		}

		if(itemsPerRow !== n) setItemsPerRow(n)
	}, [width])

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

	const orgsToDisplay = theme.chitVotingStarted ? topOrgs : orgs.values

	if(orgsLoading) return <Loading />
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
})

export default KioskInfo

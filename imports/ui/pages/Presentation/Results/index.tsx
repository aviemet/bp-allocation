import { Box, Container, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { cloneDeep } from "lodash"
import numeral from "numeral"
import { useEffect, useState } from "react"
import { useTheme, useSettings, useOrgs } from "/imports/api/hooks"

import AwardCard from "/imports/ui/components/Cards/AwardCard"
import { type OrgDataWithComputed } from "/imports/api/hooks"
import { Loading } from "/imports/ui/components"

const Results = () => {
	const { theme } = useTheme()
	const { settings } = useSettings()
	const { orgs, topOrgs } = useOrgs()
	const [shouldPulse, setShouldPulse] = useState(false)

	useEffect(() => {
		const pulseTimer = setTimeout(() => {
			setShouldPulse(true)
		}, 2000)

		return () => {
			clearTimeout(pulseTimer)
		}
	}, [])

	if(!theme) return <Loading />

	const topOrgIds = new Set(topOrgs.map(org => org._id))
	const restOrgs = orgs.filter(org => !topOrgIds.has(org._id))

	const saves = Array.isArray(theme?.saves) ? theme.saves.reduce((sum: number, save) => sum + (save?.amount || 0), 0) : 0
	let total = (theme?.leverageTotal || 0) + saves + (settings?.resultsOffset || 0)

	cloneDeep(orgs).forEach((org) => {
		total += (org?.pledgeTotal || 0) / 2
	})

	const getAwardType = (org: OrgDataWithComputed): "awardee" | "other" => {
		const totalFunds = (org.allocatedFunds || 0) + (org.leverageFunds || 0)
		return totalFunds >= (org.ask || 0) ? "awardee" : "other"
	}

	const getRunnerUpAmount = (org: OrgDataWithComputed): number => {
		const baseAmount = (org.allocatedFunds || 0) + (org.leverageFunds || 0)
		const consolation = theme.consolationActive ? (typeof theme.consolationAmount === "number" ? theme.consolationAmount : 0) : 0
		return baseAmount + consolation
	}

	return (
		<ResultsPageContainer maxWidth="xl" sx={ { p: 2 } }>
			<HeaderSection>
				<AwardsImage><img src="/img/BAT_awards.png" alt="Battery Powered Logo" /></AwardsImage>
				<Typography component="h1" variant="h2" sx={ { marginBottom: 2 } }>Total amount given: { numeral(total).format("$0.[00]a") }</Typography>
			</HeaderSection>

			<AwardsSection>
				<div>
					<Typography component="h2" variant="h3" sx={ { marginBottom: 2 } }>Finalists</Typography>
					<AwardsCards>
						{ topOrgs.map((org) => {
							const awardType = getAwardType(org)
							return (
								<AwardCard
									key={ org._id }
									org={ org }
									award={ awardType }
									amount={ (org?.allocatedFunds || 0) + org.leverageFunds }
									shouldPulse={ shouldPulse && awardType === "awardee" }
								/>
							)
						}) }
					</AwardsCards>
				</div>

				<Box mt={ 6 }>
					{ restOrgs.length > 0 && <>
						<Typography component="h2" variant="h3" sx={ { marginBottom: 2 } }>Runners Up</Typography>
						<AwardsCards>
							{ restOrgs.map((org) => {
								const awardType = getAwardType(org)
								return (
									<AwardCard
										key={ org._id }
										org={ org }
										award={ awardType }
										amount={ getRunnerUpAmount(org) }
										small={ true }
										shouldPulse={ shouldPulse && awardType === "awardee" }
									/>
								)
							}) }
						</AwardsCards>
					</> }
				</Box>
			</AwardsSection>
		</ResultsPageContainer>
	)
}

const ResultsPageContainer = styled(Container)( ({ theme }) => ({
	color: "#FFF",
	display: "grid",
	gridTemplateRows: "auto 1fr",
	minHeight: "100vh",
	height: "100%",
	gap: "2rem",

	h1: {
		fontSize: "3.6rem",
		letterSpacing: "1px",
		fontFamily: "TradeGothic",
		textTransform: "uppercase",
		textAlign: "center",

		[theme.breakpoints.down("md")]: {
			fontSize: "2rem",
			fontWeight: "bold",
		},
	},

	".ui.cards .card .content": {
		padding: "5px",

		p: {
			margin: 0,
			fontSize: "1.75rem",
		},
	},
	maxWidth: "xl",
}))

const HeaderSection = styled("div")`
	display: flex;
	flex-direction: column;
`

const AwardsSection = styled("div")`
	display: flex;
	flex-direction: column;
	height: 100%;
	justify-content: space-around;
	padding-bottom: clamp(0px, 6vh, 160px);
`

const AwardsImage = styled("div")`
	text-align: center;

	img {
		width: 15%;
	}

	@media screen and (max-width: 800px) {
		display: none;
	}
`

const AwardsCards = styled("div")`
	display: flex;
	margin: -0.5em -0.5em;
	flex-wrap: wrap;
	justify-content: center;
	text-align: center;
	font-family: "BentonMod";
`

export default Results

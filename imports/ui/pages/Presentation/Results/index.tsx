import { Container, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { cloneDeep } from "lodash"
import { observer } from "mobx-react-lite"
import numeral from "numeral"
import { useTheme, useSettings, useOrgs } from "/imports/api/providers"

import AwardCard from "/imports/ui/components/Cards/AwardCard"

const Results = observer(() => {
	const { theme } = useTheme()
	const { settings } = useSettings()
	const { topOrgs } = useOrgs()

	let awardees = []
	let others = []
	let saves = theme.saves.reduce((sum, save) => {return sum + save.amount}, 0)
	let total = parseFloat((theme.leverageTotal || 0) + saves + (settings.resultsOffset || 0))

	cloneDeep(topOrgs).map((org, i) => {
		total += org.pledgeTotal / 2

		if(org.allocatedFunds + org.leverageFunds >= org.ask) {
			awardees.push(org)
		} else {
			others.push(org)
		}

		return org
	})

	// let awardeesColumns = awardees.length > 3 ? parseInt(awardees.length / 2) + awardees.length % 2 : false

	return (
		<ResultsPageContainer maxWidth="xl" sx={ { p: 2 } }>
			<AwardsImage><img src="/img/BAT_awards.png" alt="Battery Powered Logo" /></AwardsImage>

			<Typography component="h1" variant="h2" sx={ { marginBottom: 2 } }>Total amount given: { numeral(total).format("$0.[00]a") }</Typography>

			<AwardsCards>
				{ awardees.map((org) => {
					return (
						<AwardCard
							key={ org._id }
							org={ org }
							award={ "awardee" }
							amount={ org.allocatedFunds + org.leverageFunds }
						/>
					)
				}) }
			</AwardsCards>

			<br/>

			<AwardsCards>
				{ others.map((org) => {
					return (
						<AwardCard
							key={ org._id }
							org={ org }
							award={ "other" }
							amount={ org.allocatedFunds + org.leverageFunds }
						/>
					)
				}) }
			</AwardsCards>

		</ResultsPageContainer>
	)
})

const ResultsPageContainer = styled(Container)( ({ theme }) => ({
	color: "#FFF",

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
	maxWidth: "lg",
}))

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

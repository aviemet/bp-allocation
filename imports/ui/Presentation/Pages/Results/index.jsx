import React from 'react'
import { cloneDeep } from 'lodash'
import numeral from 'numeral'

import { observer } from 'mobx-react-lite'
import { useTheme, useSettings, useOrgs } from '/imports/api/providers'

import { styled } from '@mui/system'
import { css } from '@emotion/react'

import Container from '@mui/material/Container'

import AwardCard from '/imports/ui/Components/Cards/AwardCard'

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

		if(org.allocatedFunds + org.leverageFunds >= org.ask){
			awardees.push(org)
		} else {
			others.push(org)
		}

		return org
	})

	// let awardeesColumns = awardees.length > 3 ? parseInt(awardees.length / 2) + awardees.length % 2 : false

	return (
		<ResultsPageContainer>
			<AwardsImage><img src="/img/BAT_awards.png" /></AwardsImage>

			<h1>Total amount given: {numeral(total).format('$0.[00]a')}</h1>
			<br/><br/>

			<AwardsCards>
				{ awardees.map((org) => {
					return(
						<AwardCard
							key={ org._id }
							org={ org }
							award={ 'awardee' }
							amount={ org.allocatedFunds + org.leverageFunds }
						/>
					)
				}) }
			</AwardsCards>

			<br/>

			<AwardsCards>
				{ others.map((org) => {
					return(
						<AwardCard
							key={ org._id }
							org={ org }
							award={ 'other' }
							amount={ org.allocatedFunds + org.leverageFunds }
						/>
					)
				}) }
			</AwardsCards>

		</ResultsPageContainer>
	)
})


const AwardsCards = styled('div')`display: flex;
	margin: -0.5em -0.5em;
	flex-wrap: wrap;
	justify-content: center;
	text-align: center;
	font-size: 16px;
	font-family: "BentonMod";
`

const AwardsImage = styled('div')`
	text-align: center;

	img {
		width: 10%;
	}

	@media screen and (max-width: 800px) {
		display: none;
	}
`

const ResultsPageContainer = styled(Container)( ({ theme }) => ({
	root: css`
		color: #FFF;

		&& {
			h1, h2 {
				line-height: 1em;
				color: #FFF;
				text-transform: uppercase;
				letter-spacing: 1px;
				font-family: TradeGothic;
				text-align: center;
			}
			h1 {
				font-size: 3.8em;
				margin: 0;

				@media screen and (max-width: 800px) {
					margin-top: 50px;
				}
			}

			h2 {
				font-size: 2.75em;
				margin: 2px 0 0 0;
			}
		}

		.ui.cards .card .content {
			padding: 5px;

			p{
				margin: 0;
				font-size: 1.75em;
			}
		}
	`,
	maxWidth: 'lg'
}))

export default Results

import React from 'react'

import { observer } from 'mobx-react-lite'
import { useSettings, useOrgs } from '/imports/api/providers'

import { Header, Card } from 'semantic-ui-react'
import styled from 'styled-components'

import AwardCard from '/imports/ui/Components/AwardCard'

const Awards = observer(() => {
	const { settings } = useSettings()
	const { topOrgs } = useOrgs()

	let winner = 0
	for(let i = 1; i < topOrgs.length; i++){
		if(topOrgs[i].allocatedFunds + topOrgs[i].leverageFunds > topOrgs[winner].allocatedFunds + topOrgs[winner].leverageFunds) {
			winner = i
		}
	}

	return (
		<AwardsPageContainer>
			{/* <AwardsImage src="/img/BAT_awards.png" /> */}

			<Header as='h2'>Battery Powered Awardee</Header>

			<Card.Group centered>
				<AwardCard
					org={ topOrgs[winner] }
					award={ 'awardee' }
					amount={ settings.awardAmount }
				/>
			</Card.Group>
			{/* <br/>
			<Header as='h2'>Other winners</Header>

			<Card.Group centered >
				{ topOrgs.map((org) => {
					if(org._id !== topOrgs[winner]._id) {
						return(
							<OrgCard
								key={ org._id }
								org={ org }
							/>
						)
					}
				}) }
			</Card.Group> */}

		</AwardsPageContainer>
	)
})

const AwardsPageContainer = styled.div`
	color: #FFF;
	position: absolute;
	top: 2rem;

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
		}

		h2 {
			font-size: 2.75em;
			margin: 2px 0 0 0;
		}
	}

	.ui.cards .card .content {
		padding: 5px;
		text-align: center;

		p{
			margin: 0;
			font-size: 1.75em;
			text-align: center;
		}
	}
`

export default Awards

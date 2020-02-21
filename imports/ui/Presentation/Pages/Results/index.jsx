import React from 'react';
import { cloneDeep } from 'lodash';
import numeral from 'numeral';

import { observer } from 'mobx-react-lite';
import { useTheme, useSettings, useOrgs } from '/imports/api/providers';

import { Header, Card } from 'semantic-ui-react';
import styled from 'styled-components';

import AwardCard from '/imports/ui/Components/AwardCard';

const Results = observer(() => {
	const { theme } = useTheme();
	const { settings } = useSettings();
	const { topOrgs } = useOrgs();

	let awardees = [];
	let others = [];
	let saves = theme.saves.reduce((sum, save) => {return sum + save.amount;}, 0);
	let total = parseFloat((theme.leverageTotal || 0) + saves + (settings.resultsOffset || 0));

	cloneDeep(topOrgs).map((org, i) => {
		total += org.pledgeTotal / 2;

		if(settings.formatAsDollars) {
			if(org.allocatedFunds + org.leverageFunds >= org.ask){
				awardees.push(org);
			} else {
				others.push(org);
			}
		} else {
			if(awardees.length === 0) {
				awardees.push(org);
			} else {
				const compareTotal = awardees[0].allocatedFunds + awardees[0].leverageFunds;
				if(org.allocatedFunds + org.leverageFunds > compareTotal) {
					others.push(awardees[0]);
					awardees[0] = org;
				} else {
					others.push(org);
				}
			}
		}
		return org;
	});

	// let awardeesColumns = awardees.length > 3 ? parseInt(awardees.length / 2) + awardees.length % 2 : false ;

	return (
		<ResultsPageContainer>
			<AwardsImage src="/img/BAT_awards.png" />

			<Header as='h1'>
					Total amount given: {numeral(total).format('$0.[00]a')}
			</Header>
			<br/><br/>
			{/*<Header as='h2'>Battery Powered Awardees</Header>*/}

			<Card.Group centered>
				{awardees.map((org) => {
					return(
						<AwardCard
							key={ org._id }
							org={ org }
							award={ 'awardee' }
							amount={ org.allocatedFunds + org.leverageFunds }
						/>
					);
				})}
			</Card.Group>
			<br/>
			{/*<Header as='h2'>Other winners</Header>*/}

			<Card.Group centered >
				{others.map((org) => {
					return(
						<AwardCard
							key={ org._id }
							org={ org }
							award={ 'other' }
							amount={ org.allocatedFunds + org.leverageFunds }
						/>
					);
				})}
			</Card.Group>

		</ResultsPageContainer>
	);
});

const ResultsPageContainer = styled.div`
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
`;

const AwardsImage = styled.img`
	width: 10%;
`;

export default Results;

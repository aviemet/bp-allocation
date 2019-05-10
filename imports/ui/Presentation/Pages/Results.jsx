import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import _ from 'lodash';
import numeral from 'numeral';

import { ThemeContext, OrganizationContext, PresentationSettingsContext, ImageContext } from '/imports/context';

import { Loader, Header, Container, Grid, Card } from 'semantic-ui-react';
import styled from 'styled-components';

import OrgCard from '/imports/ui/Components/OrgCard';

import { COLORS } from '/imports/utils';

const ResultsPageContainer = styled.div`
	color: #FFF;

	&& {
		h1, h2{
			line-height: 1em;
			color: #FFF;
			text-transform: uppercase;
	    letter-spacing: 1px;
			font-family: TradeGothic;
		}
		h1 {
			font-size: 3.8em;
			margin: 0;
		}

		h2{
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

const Results = props => {

	const { theme } = useContext(ThemeContext);
	const { topOrgs } = useContext(OrganizationContext);
	const { settings } = useContext(PresentationSettingsContext);
	const { images } = useContext(ImageContext);

	console.log({theme});
	console.log({topOrgs});

	let awardees = [];
	let others = [];
	let saves = theme.saves.reduce((sum, save) => {return sum + save.amount}, 0);
	let total = parseFloat((theme.leverageTotal || 0) + saves + (settings.resultsOffset || 0));

	let orgs = _.cloneDeep(topOrgs).map(org => {
		total += org.pledgeTotal / 2;

		if(org.allocatedFunds + org.leverageFunds >= org.ask){
			awardees.push(org);
		} else {
			others.push(org);
		}
		return org
	});

	let awardeesColumns = awardees.length > 3 ? parseInt(awardees.length / 2) + awardees.length % 2 : false ;

	let i = -1;
	return (
		<ResultsPageContainer>
			<AwardsImage src="/img/BAT_awards.png" />

			<Header as='h1'>
				Total amount given: {numeral(total).format('$0.[00]a')}
			</Header>

			<Header as='h2'>Battery Powered Awardees</Header>

			<Card.Group centered>
			{awardees.map((org) => {
				i++;
				return(
					<OrgCard
						key={org._id}
						org={org}
						image={_.find(images, ['_id', org.image])}
						bgcolor={COLORS[i % COLORS.length]}
						award={true}
						awardtype={'awardee'}
					/>
				);
			})}
			</Card.Group>
			<br/>
			<Header as='h2'>Other winners</Header>

			<Card.Group centered >
			{others.map((org) => {
				i++;
				return(
					<OrgCard
						key={org._id}
						org={org}
						image={_.find(images, ['_id', org.image])}
						bgcolor={COLORS[i % COLORS.length]}
						award={true}
						awardtype={'other'}
					/>
				);
			})}
			</Card.Group>

		</ResultsPageContainer>
	);
}

export default Results;

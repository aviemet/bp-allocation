import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import _ from 'lodash';
import numeral from 'numeral';

import { withTracker } from 'meteor/react-meteor-data';

import { Loader, Header, Container, Grid, Card } from 'semantic-ui-react';
import styled from 'styled-components';

import OrgCard from '/imports/ui/Components/OrgCard';

import { COLORS } from '/imports/utils';

const ResultsPageContainer = styled.div`
	color: #FFF;

	&& {
		h1 {
			color: #FFF;
			text-transform: uppercase;
	    letter-spacing: 1px;
			font-family: TradeGothic;
			font-size: 3.8em;
			margin: 0 0 0.5em 0;
		}

		h2{
			color: #FFF;
			text-transform: uppercase;
	    letter-spacing: 1px;
			font-family: TradeGothic;
			font-size: 2.75em;
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

export default class Intro extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let awardees = [];
		let others = [];
		let saves = this.props.theme.saves.reduce((sum, save) => {return sum + save.amount}, 0);
		let total = this.props.theme.leverage_total + saves;

		let orgs = _.cloneDeep(this.props.orgs).map(org => {
			total += org.pledges / 2;

			org.save = this.props.theme.saves.find(save => save.org === org._id);
			org.totalFunds = org.amount_from_votes + org.leverage_funds + org.pledges + org.topoff + (org.save ? org.save.amount : 0);

			if(org.totalFunds >= org.ask){
				awardees.push(org);
			} else {
				others.push(org);
			}
			return org
		});

		let i = -1;
		return (
			<ResultsPageContainer>
				<AwardsImage src="/img/BAT_awards.png" />

				<Header as='h1'>
					Total amount given: {numeral(total + (this.props.theme.results_offset || 0)).format('$0.[00]a')}
				</Header>

				<Header as='h2'>Battery Powered Awardees</Header>

				<Container>
					<Card.Group centered >
					{awardees.map((org) => {
						i++;
						return(
							<OrgCard
								org={org}
								bgcolor={COLORS[i]}
								award={true}
								awardtype={'awardee'}
								key={org._id}
							/>
						);
					})}
					</Card.Group>
				</Container>

				<Header as='h2'>Other winners</Header>

				<Container>
					<Card.Group centered >
					{others.map((org) => {
						i++;
						return(
							<OrgCard
								org={org}
								bgcolor={COLORS[i]}
								award={true}
								awardtype={'other'}
								key={org._id}
							/>
						);
					})}
					</Card.Group>
				</Container>
			</ResultsPageContainer>
		);
	}
}


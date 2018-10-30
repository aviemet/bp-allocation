import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'underscore';
import numeral from 'numeral';

import { Loader, Header, Container, Grid, Card } from 'semantic-ui-react';
import styled from 'styled-components';

import OrgCard from '/imports/ui/Presentation/OrgCard';

import { COLORS } from '/imports/utils';

const ResultsPageContainer = styled.div`
	color: #FFF;

	&& h1{
		color: #FFF;
		text-transform: uppercase;
    letter-spacing: 1px;
		font-family: TradeGothic;
		font-size: 3em;
	}
`;

const AwardsImage = styled.img`
	width: 12%;
`;

export default class Intro extends React.Component {
	constructor(props) {
		super(props);

		this.orgDisplays = {
			awardees: [],
			others: []
		};
		var total = 0;

		// Run one loop through the orgs for the info we'll need
		this.props.orgs.map((org) => {
			// Calculate the total allocated
			total += org.value;

			// Separate orgs into 'Awardees' and 'Other Winners'
			if(org.value >= org.ask){
				this.orgDisplays.awardees.push(org);
			} else {
				this.orgDisplays.others.push(org);
			}
		});

		let offset = 0;
		if(this.props.theme.results_offset && this.props.theme.results_offset !== 0){
			offset = this.props.theme.results_offset;
		}

		var format = total > 999999 ? '$0.0a' : '$0.[00]a';

		this.state = {
			total: total,
			offset: offset,
			format: format
		}
	}

	componentDidUpdate(prevProps, prevState){
		let offset = this.props.theme.results_offset || 0;
		if(offset !== this.state.offset){
			this.setState({offset: offset});
		}
	}

	render() {
		let i = -1;
		return (
			<ResultsPageContainer>
				<AwardsImage src="/img/BAT_awards.png" />

				<Header as='h1'>Total amount given: {numeral(this.state.total + this.state.offset).format(this.state.format)}</Header>

				<Header as='h1'>Battery Powered Awardees</Header>

				<Container>
					<Card.Group centered >
					{this.orgDisplays.awardees.map((org) => {
						i++;
						return(
							<OrgCard org={org} bgcolor={COLORS[i]} award={true} awardtype={'awardee'} key={org._id} />
						);
					})}
					</Card.Group>
				</Container>

				<Header as='h1'>Other winners</Header>

				<Container>
					<Card.Group centered >
					{this.orgDisplays.others.map((org) => {
						i++;
						return(
							<OrgCard org={org} bgcolor={COLORS[i]} award={true} awardtype={'other'} key={org._id} />
						);
					})}
					</Card.Group>
				</Container>
			</ResultsPageContainer>
		);
	}
}


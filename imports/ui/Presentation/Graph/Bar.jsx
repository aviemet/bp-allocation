import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { Organizations } from '/imports/api';

import numeral from 'numeral';

import { Loader, Grid, Image } from 'semantic-ui-react';
import styled from 'styled-components';

const BarContainer = styled(Grid.Column)`
	height: 100%;
	padding: 0;
	text-align: center;
`;

const GraphBar = styled.div`
	position: absolute;
	bottom: 0;
	left: 50%;
	width: 80%;
	transform: translateX(-50%);

	-webkit-animation: animate-bar 4s 1 ease-out;
	-webkit-transition: all 1.5s ease-out;
`;

const Pledged = styled.span`
	position: relative;
	display: block;
	top: 54%;
	width: 100%;
	text-align: center;
	color: #fff;
	line-height: 1;
	text-shadow: none;
	opacity: 0;
	font-size: 3em;

	-webkit-animation: reveal-amount .5s ease 4s;
	animation: reveal-amount .8s ease 4s;
	-webkit-animation-fill-mode: forwards;
`;

const Award = styled.img`
	position: absolute;
	width: 55%;
	top: 0;
	left: 50%;
	transform: translate(-50%, -104%);
	opacity: 0;
	margin-top: 55px;

	-webkit-animation: reveal-winner-logo .5s ease 4s;
	animation: reveal-winner-logo .8s ease 4s;
	-webkit-animation-fill-mode: forwards;
`;

const AwardImg = ({show}) => {
	if(show){
		return (
			<Award src='/img/BAT_award_logo.svg' />
		)
	}
	return(
		<React.Fragment />
	)
}

class Bar extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		if(this.props.loading){
			return ( <Loader /> )
		}

		let save = this.props.theme.saves.find( save => save.org === this.props.org._id );

		let funded =
			(this.props.org.pledges || 0) +
			(this.props.org.amount_from_votes || 0) +
			(this.props.org.topoff || 0) +
			(this.props.org.leverage_funds || 0) +
			(save ? save.amount : 0);

		let height = Math.min(Math.round((funded / this.props.org.ask) * 100), 100);

		if(height === 0){
			return (
			<Grid.Column>
				<BarContainer />
			</Grid.Column> );
		}
		return (
			<BarContainer>
				<AwardImg show={height === 100} />
				<GraphBar style={{height: `${height}%`, backgroundColor: this.props.color }}>
					<Pledged>${numeral(funded).format('0.0a')}</Pledged>
				</GraphBar>
			</BarContainer>
		);

	}
}

export default Bar;

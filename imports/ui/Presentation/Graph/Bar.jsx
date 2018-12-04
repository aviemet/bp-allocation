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

		this.state = {
			height: 0
		}
	}

	componentDidUpdate(prevProps, prevState) {
		let org = this.props.org;

		let height = 0;
		if(org.pledges > 0 || org.amount_from_votes > 0)
			height = Math.round(( ((org.pledges || 0) + (org.amount_from_votes || 0) + (org.topoff || 0)) / org.ask) * 100);

		if(height > 100) height = 100;

		if(prevState.height !== height){
			this.setState({
				height: height
			});
		}
	}

	render() {
		if(this.props.loading){
			return ( <Loader /> )
		}

		if(this.state.height === 0){
			return (
			<Grid.Column>
				<BarContainer />
			</Grid.Column> );
		}
		return (
			<BarContainer>
				<AwardImg show={this.state.height === 100} />
				<GraphBar style={{height: `${this.state.height}%`, backgroundColor: this.props.color }}>
					<Pledged>${numeral(this.props.org.pledges + this.props.org.amount_from_votes).format('0.0a')}</Pledged>
				</GraphBar>
			</BarContainer>
		);

	}
}

export default withTracker(({org_id}) => {
	let orgsHandle = Meteor.subscribe('organization', org_id);

	return {
		loading: !orgsHandle.ready(),
		org: Organizations.find({_id: org_id}).fetch()[0]
	}
})(Bar);

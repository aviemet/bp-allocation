import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

import { Organizations } from '/imports/api';

import numeral from 'numeral';

import { Loader, Grid } from 'semantic-ui-react';
import styled from 'styled-components';

const InfoContainer = styled(Grid.Column)`
	&&{
		margin: 0 1.5em;
		padding: 0 !important;
		margin-bottom: -6px;
		bottom: 0;
		text-align: center;
		font-size: 1.5em;
		line-height: 1em;
	}
`;

const Title = styled.div`
	min-height: 60px;
`;

const Ask = styled.div`
	color: #ea810c;
`;

const MatchNeed = styled.div`
	color: #00853f;
`;

const TotalNeed = styled.div`
	color: #c31a1a;
`;

class OrgInfo extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			need: this.props.org.ask - this.props.org.pledges || 0
		}
	}

	componentDidUpdate(prevProps, prevState) {
		let need = this.props.org.ask - this.props.org.pledges;

		if(prevState.need !== need){
			console.log({prevStateNeed: prevState.need, need});
			this.setState({ need: need });
		}

	}

	render() {
		if(this.props.loading){
			return ( <Loader /> );
		}
		return (
			<InfoContainer className='orginfo'>
				<Title>{this.props.org.title}</Title>
				<Ask>Ask: ${numeral(this.props.org.ask).format('0.0a')}</Ask>
				<MatchNeed>Match Need: {this.state.need > 0 ? `$${numeral(this.state.need/2).format('0.0a')}` : '--'}</MatchNeed>
				<TotalNeed>Total Need: {this.state.need > 0 ? `$${numeral(this.state.need).format('0.0a')}` : '--'}</TotalNeed>
			</InfoContainer>
		);
	}
}

export default OrgInfo;

// withTracker(({org_id}) => {
// 	let orgsHandle = Meteor.subscribe('organization', org_id);
// 	return {
// 		loading: !orgsHandle.ready(),
// 		org: Organizations.find({_id: org_id}).fetch()[0]
// 	}
// })(OrgInfo);

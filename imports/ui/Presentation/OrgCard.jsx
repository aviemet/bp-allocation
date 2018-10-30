import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { Card, Image } from 'semantic-ui-react';
import styled from 'styled-components';

import { Organizations } from '/imports/api';
import { OrganizationsSchema } from '/imports/api/schema';

const OrgTitle = styled.p`
	font-family: TradeGothic;
	font-size: 1.5em;
	margin: 5px;
`;

const OrgAsk = styled.p`
	font-family: TradeGothic20;
	font-size: 2em;
	font-weight: 700;
`;

const CardImage = styled.div`
	width: 100%;
	height: 225px;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
`;

const CardContent = styled(Card.Content)`
	background-color: ${props => props.bgcolor} !important;
	color: ${props => (props.bgcolor ? '#FFF' : '#222')};
`;

const AwardEmblem = styled.div`
	width: 100%;
	height: 100%;
	text-align: center;
`;

const AwardImage = styled.div`
	width: 100%;
	height: 100%;
	background-position: center center;
	position: relative;
`;

const AwardAmount = styled.span`
	color: #fff;
	font-family: TradeGothic;
	z-index: 999;
	font-weight: 700;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translateX(-50%);
`

const Award = ({show, type, amount}) => {
	if(show === true){

		const awardImgSrc = {
			awardee: '/img/circle_awardee.png',
			other: '/img/circle.png'
		};

		return (
			<AwardEmblem>
				<AwardImage style={{backgroundImage: `url(${awardImgSrc[type || 'awardee']})`,
	backgroundSize: type === 'awardee' ? '120%' : '100%'}}>
					<AwardAmount style={{fontSize: type === 'awardee' ? '3.3em' : '2.9em'}}>{numeral(amount).format('$0.0a')}</AwardAmount>
				</AwardImage>
			</AwardEmblem>
		);
	}
	return (<React.Fragment />);
}

export default class OrgCard extends React.Component {
	static propTypes = {
		org: PropTypes.object.isRequired,
		bgcolor: PropTypes.string,
		award: PropTypes.bool,
		awardtype: PropTypes.oneOf(['awardee', 'other'])
	};

	constructor(props) {
		super(props);
	}

	render() {
		// Add animation class if toggled
		var animateClass = '';
		if(this.props.animateClass){
			animateClass = 'animate-orgs';
		}
		return (
			<Card className={animateClass}>
				<CardImage style={{ backgroundImage: `url(${this.props.org.image.path})` }}>
					<Award show={this.props.award} type={this.props.awardtype} amount={this.props.org.value} />
				</CardImage>
				<CardContent bgcolor={this.props.bgcolor || '#FFF'}>
					<OrgTitle>{this.props.org.title}</OrgTitle>
					<OrgAsk>{numeral(this.props.org.ask).format('$0a')}</OrgAsk>
				</CardContent>
			</Card>
		);
	}
}

import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { Card, Image } from 'semantic-ui-react';
import styled from 'styled-components';

import { Organizations, Images } from '/imports/api';
import { OrganizationsSchema } from '/imports/api/schema';

const OrgTitle = styled.p`
	font-family: TradeGothic;
	font-size: 1.5em;
	margin: 5px;
	font-weight: 600;
`;

const OrgAsk = styled.p`
	font-family: TradeGothic20;
	font-size: 2.1em;
	font-weight: 700;
`;

const CardImage = styled.div`
	width: 100%;
	height: 205px;
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

const AwardImage = styled(Image)`
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
				<AwardImage className='ui.card.image' style={{backgroundImage: `url(${awardImgSrc[type || 'awardee']})`,
	backgroundSize: type === 'awardee' ? '120%' : '100%'}}>
					<AwardAmount style={{fontSize: type === 'awardee' ? '3.3em' : '2.9em'}}>{numeral(amount).format('$0.0a')}</AwardAmount>
				</AwardImage>
			</AwardEmblem>
		);
	}
	return (<React.Fragment />);
}

export default class OrgCard extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		// Add animation class if toggled
		let animateClass = this.props.animateClass ? 'animate-orgs' : '';
		let imagePath = '';
		if(this.props.org.image && this.props.org.image.path){
			imagePath = Images.link(this.props.org.image, 'original', '/');
		}
		console.log({imagePath, 'image.path':this.props.org.image.path, image: this.props.org.image});
		let className = this.props.bgcolor ? 'white' : '';
		return (
			<Card className={animateClass}>
				<CardImage style={{ backgroundImage: `url(${imagePath})` }} className='orgsImage'>
					<Award show={this.props.award} type={this.props.awardtype} amount={this.props.org.totalFunds} />
				</CardImage>
				<CardContent bgcolor={this.props.bgcolor || '#FFF'} className={className}>
					<OrgTitle>{this.props.org.title}</OrgTitle>
					<OrgAsk>{numeral(this.props.org.ask).format('$0a')}</OrgAsk>
				</CardContent>
			</Card>
		);
	}
}

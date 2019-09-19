import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { Grid } from 'semantic-ui-react';
import styled from 'styled-components';

import { COLORS } from '/imports/global';

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
	background-color: ${COLORS.blue};

	animation: animate-bar 4s 1 ease-out;
	transition: height 4s ease-out,
	            background-color 5s ease-in;
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

const AwardImg = ({ show }) => {
	if(show !== true) return <React.Fragment />;

	return (
		<Award src='/img/BAT_award_logo.svg' />
	);

};

AwardImg.propTypes = {
	show: PropTypes.bool
};

const Bar = observer(props => {
	const data = useData();
	const { settings } = data;
	const members = data.members.values;
	
	let shownFunds = props.org.allocatedFunds + (props.org.leverageFunds || 0);
	if(!props.savesVisible) shownFunds -= props.org.save;

	let height = Math.min(Math.round((shownFunds / props.org.ask) * 100), 100);
	let backgroundColor = height === 100 ? COLORS.green : COLORS.blue;

	if(!settings.formatAsDollars) {
		const percentBase = members.length * 100;
		console.log({ percentBase, shownFunds });
		shownFunds = (shownFunds / percentBase);
		console.log({ percentBase, shownFunds });
	}

	if(height === 0){
		return (
			<Grid.Column>
				<BarContainer />
			</Grid.Column> );
	}
	return (
		<BarContainer>
			<AwardImg show={ height === 100 } />
			<GraphBar style={ { height: `${height}%`, backgroundColor: backgroundColor } }>
				<Pledged>{numeral(shownFunds).format(settings.numberFormat)}</Pledged>
			</GraphBar>
		</BarContainer>
	);
});

Bar.propTypes = {
	org: PropTypes.object,
	savesVisible: PropTypes.bool
};

export default Bar;

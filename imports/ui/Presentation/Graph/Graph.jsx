import React from 'react';
import numeral from 'numeral';
import _ from 'underscore';

import styled from 'styled-components';
import { Grid, Progress } from 'semantic-ui-react';

import OrgInfo from '/imports/ui/Presentation/Graph/OrgInfo';
import Bar from '/imports/ui/Presentation/Graph/Bar';

import { COLORS } from '/imports/utils';

const GraphPageContainer = styled.div`
	overflow-y: hidden;
	font-size: 18px;
	font-family: 'TradeGothic20';
	color: #fff;
	min-height: 100%;
`;

const GraphContainer = styled.div`
	width: 90%;
	height: 48vh;
	position: relative;
	margin: 10em auto 0 7em;
`;

const XAxis = styled.div`
	height: 100%;
	position: absolute;
	bottom: 0;
	left: 0;
	display: block;
	border-right: 3px solid #FFF;

	span{
		position: absolute;
		left: 0;
		text-align: right;
		margin-left: -2.5em;
		font-size: 2em;
		display: block;
	}
`;

const YAxis = styled.div`
	position: absolute;
	top:100%;
	border-color: #fff;
	width: 100%;
	height: 3px;
	border-top:0;
	border-left: 0;
	border-bottom: 0;
	border-right: 0;
	border-style: solid;
	background: #fff;
`;

const Goal = styled.div`
	position: absolute;
	width: 100%;
	height: 1px;
	border-top:2px;
	border-left: 0;
	border-bottom: 0;
	border-right: 0;
	border-style: dashed;
`;

const BarsOuterContainer = styled.div`
	width: 100%;
	position: relative;
	margin: 2em auto 0 auto;
	min-height: 100%;
`;

const BarsInnerContainer = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
`;

const BarsContainer = styled(Grid)`
	width: 100%;
	height: 100%;

	&& {
		margin-left: 0;
	}
`;

const InfoContainer = styled.div`
	text-align: left;
	margin: 2em auto 0 7em;
	width: 90%;
`;

const InfoGrid = styled(Grid)`
	&& {
		margin-left: 0;
	}
`;

const ProgressBar = styled(Progress)`
	color: #FFF;

	&& .bar{
		background: #CCCCCC;
	}

	&& .label{
		color: #FFF;
		font-size:
	}
`;

const LeverageCount = styled.div`
	position: absolute;
	color: #FFF;
  top: 15px;
  right: 14px;
  text-align: right;
  font-size: 2em;
  padding-right: .2em;
`;

const Graph = (props) => {
	console.log({props});
	const _calcStartingLeverage = () => {
		let leverage = props.theme.leverage_total;

		props.orgs.map((org) => {
			leverage -= org.amount_from_votes || 0;
			leverage -= org.topoff || 0;
		});
		if(props.theme.consolation_active) {
			leverage -= (props.theme.organizations.length - props.orgs.length) * props.theme.consolation_amount;
		}
		return leverage;
	}

	const visibility = props.theme.leverage_visible ? 'visible' : 'hidden';
	const startingLeverage = _calcStartingLeverage();

	// const pledges = props.orgs.reduce((sum, org) => {return sum + org.pledges}, 0);

	return (
		<GraphPageContainer>
			<GraphContainer id='graph'>
				<XAxis>
					<span style={{top: "0%"}}>100%</span>
					<span style={{top: "50%"}}>50%</span>
					<span style={{top: "100%"}}>0%</span>
				</XAxis>

				<YAxis />

				<Goal style={{top: 0}} />
				<Goal style={{top: "50%"}} />

					<BarsContainer columns='equal'>
					{props.orgs.map((org, i) => (
						<Bar org={org} theme={props.theme} key={org._id} color={COLORS[i%COLORS.length]} />
					))}
					</BarsContainer>

			</GraphContainer>

			<InfoContainer>
				<InfoGrid columns='equal'>
					<Grid.Row>
					{props.orgs.map((org) => (
						<OrgInfo org={org} theme={props.theme} key={org._id} />
					))}
					</Grid.Row>

					<Grid.Row style={{visibility: visibility}}>
						<Grid.Column>
							<ProgressBar value={startingLeverage - props.theme.leverage_used} total={startingLeverage} inverted color='green' size='large' />
							<LeverageCount>${numeral(startingLeverage - props.theme.leverage_used).format('0.0a')}</LeverageCount>
						</Grid.Column>
					</Grid.Row>
				</InfoGrid>
			</InfoContainer>
		</GraphPageContainer>
	);
}

export default Graph;

import React from 'react';
import numeral from 'numeral';

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
	height: 55vh;
	position: relative;
	margin: 16em auto 0 7em;
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
		background: #AAA;
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

export default class Graph extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			leverage: (this.props.theme.leverage_total - this.props.theme.leverage_used) || 0
		}
	}

	componentDidUpdate(prevProps, prevState){
		if(prevProps.theme.leverage_used !== this.props.theme.leverage_used){
			this.setState({leverage: this.props.theme.leverage_total - this.props.theme.leverage_used});
		}
	}

	render() {
		const visibility = this.props.theme.leverage_visible ? 'visible' : 'hidden';
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
						{this.props.orgs.map((org, i) => (
							<Bar org_id={org._id} key={org._id} color={COLORS[i%COLORS.length]} />
						))}
						</BarsContainer>

				</GraphContainer>

				<InfoContainer>
					<InfoGrid columns='equal'>
						<Grid.Row>
						{this.props.orgs.map((org) => (
							<OrgInfo org_id={org._id} key={org._id} />
						))}
						</Grid.Row>

						<Grid.Row style={{visibility: visibility}}>
							<Grid.Column>
								<ProgressBar value={this.state.leverage} total={this.props.theme.leverage_total} inverted color='green' size='large' />
								<LeverageCount>${numeral(this.state.leverage).format('0.0a')}</LeverageCount>
							</Grid.Column>
						</Grid.Row>
					</InfoGrid>
				</InfoContainer>
			</GraphPageContainer>
		);
	}
}

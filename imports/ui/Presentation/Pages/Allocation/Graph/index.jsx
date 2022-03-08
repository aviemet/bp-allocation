import React from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'

import { observer } from 'mobx-react-lite'
import { useTheme, useSettings, useOrgs } from '/imports/api/providers'

import styled from '@emotion/styled'
import { Grid, Progress } from 'semantic-ui-react'

import OrgInfo from './OrgInfo'
import Bar from './Bar'

const Graph = observer(props => {
	const { theme } = useTheme()
	const { settings } = useSettings()
	const { orgs, topOrgs } = useOrgs()

	const startingLeverage = () => {
		let leverage = theme.leverageTotal

		topOrgs.map((org) => {
			leverage -= org.votedAmounts || 0
			leverage -= org.topOff || 0
		})
		if(theme.consolationActive) {
			leverage -= (theme.organizations.length - orgs.values.length) * theme.consolationAmount
		}
		return leverage
	}

	const visibility = settings.leverageVisible || props.simulation ? 'visible' : 'hidden'
	const orgLeverage = topOrgs.reduce((sum, org) => {
		if(org.leverageFunds) return sum + org.leverageFunds
		return sum
	}, 0)
	const leverageAfterDistribution = theme.leverageRemaining - orgLeverage

	return (
		<GraphPageContainer>
			<GraphContainer id='graph'>
				<XAxis>
					<span style={ { top: '0%' } }>100%</span>
					<span style={ { top: '50%' } }>50%</span>
					<span style={ { top: '100%' } }>0%</span>
				</XAxis>

				<YAxis />

				<Goal style={ { top: 0 } } />
				<Goal style={ { top: '50%' } } />

				<BarsContainer columns='equal'>
					{topOrgs.map((org, i) => (
						<Bar
							key={ org._id }
							org={ org }
							theme={ theme }
							savesVisible={ settings.savesVisible }
						/>
					))}
				</BarsContainer>

			</GraphContainer>

			<InfoContainer id="info">
				<InfoGrid columns='equal'>
					<Grid.Row>
						{topOrgs.map((org) => (
							<OrgInfo
								org={ org }
								theme={ theme }
								key={ org._id }
								showLeverage={ settings.leverageVisible }
							/>
						))}
					</Grid.Row>

					<Grid.Row style={ { visibility: visibility } }>
						<Grid.Column>
							<ProgressBar
								value={ leverageAfterDistribution }
								total={ startingLeverage() }
								color='green'
								size='large'
							/>
							<LeverageCount>${ numeral(leverageAfterDistribution).format('0.00a') }</LeverageCount>
						</Grid.Column>
					</Grid.Row>
				</InfoGrid>
			</InfoContainer>
		</GraphPageContainer>
	)
})

const GraphPageContainer = styled.div`
	overflow-y: hidden;
	font-size: 18px;
	font-family: 'TradeGothic20';
	color: #fff;
	min-height: 100%;
`

const GraphContainer = styled.div`
	width: 90%;
	height: 45vh;
	position: relative;
	margin: 12em auto 0 7em;
`

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
`

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
`

const Goal = styled.div`
	position: absolute;
	width: 100%;
	height: 1px;
	border-top:2px;
	border-left: 0;
	border-bottom: 0;
	border-right: 0;
	border-style: dashed;
`
/*
const BarsOuterContainer = styled.div`
	width: 100%;
	position: relative;
	margin: 2em auto 0 auto;
	min-height: 100%;
`

const BarsInnerContainer = styled.div`
	width: 100%;
	height: 100%;
	position: absolute;
`
*/
const BarsContainer = styled(Grid)`
	width: 100%;
	height: 100%;

	&& {
		margin-left: 0;
	}
`

const InfoContainer = styled.div`
	text-align: left;
	margin: 2em auto 0 7em;
	width: 90%;
`

const InfoGrid = styled(Grid)`
	&& {
		margin-left: 0;
	}
`

const ProgressBar = styled(Progress)`
	color: #FFF;

	&& .bar {
		background: #CCCCCC;
		transition: width 4s ease-in-out;
	}

	&& .label {
		color: #FFF;
	}
`

const LeverageCount = styled.div`
	position: absolute;
	color: #FFF;
  top: 0;
  right: 15px;
  text-align: right;
  font-size: 2em;
  padding-right: .2em;
`

Graph.propTypes = {
	simulation: PropTypes.bool
}

export default Graph

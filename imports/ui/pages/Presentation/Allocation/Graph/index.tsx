import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import { useTheme, useSettings, useOrgs } from "/imports/api/providers"

import Bar from "./Bar"
import LeverageBar from "./LeverageBar"
import OrgInfo from "./OrgInfo"
import { Loading } from "/imports/ui/components"

interface GraphProps {
	simulation?: boolean
}

const Graph = observer((props: GraphProps) => {
	const { theme } = useTheme()
	const { settings } = useSettings()
	const { orgs, topOrgs } = useOrgs()

	if(!theme || !settings || !orgs) return <Loading />

	const startingLeverage = () => {
		let leverage = Number(theme.leverageTotal || 0)

		topOrgs.map((org) => {
			leverage -= org.votedTotal || 0
			leverage -= org.topOff || 0
		})
		if(theme.consolationActive && theme.organizations) {
			leverage -= (theme.organizations.length - orgs.values.length) * (theme.consolationAmount || 0)
		}
		return leverage
	}

	const visibility = settings.leverageVisible || props.simulation ? "visible" : "hidden"
	const orgLeverage = topOrgs.reduce((sum, org) => {
		if(org.leverageFunds) return sum + org.leverageFunds
		return sum
	}, 0)
	const leverageAfterDistribution = Number(theme.leverageRemaining || 0) - orgLeverage

	return (
		<GraphPageContainer>
			<GraphContainer id="graph">
				<XAxis>
					<span style={ { top: "0%" } }>100%</span>
					<span style={ { top: "50%" } }>50%</span>
					<span style={ { top: "100%" } }>0%</span>
				</XAxis>

				<YAxis />

				<Goal style={ { top: 0 } } />
				<Goal style={ { top: "50%" } } />

				<BarsContainer cols={ topOrgs.length }>
					{ topOrgs.map((org) => (
						<Bar
							key={ org._id }
							org={ org }
							theme={ theme }
							savesVisible={ settings.savesVisible || false }
						/>
					)) }
				</BarsContainer>

			</GraphContainer>

			<InfoContainer id="info">
				<InfoGrid cols={ topOrgs.length }>
					{ topOrgs.map((org) => (
						<OrgInfo
							org={ org }
							key={ org._id }
							showLeverage={ settings.leverageVisible || false }
						/>
					)) }
				</InfoGrid>

				<LeverageContainer style={ { visibility: visibility } }>
					<LeverageBar
						value={ leverageAfterDistribution }
						total={ startingLeverage() }
					/>
				</LeverageContainer>

			</InfoContainer>
		</GraphPageContainer>
	)
})

const GraphPageContainer = styled.div`
	font-size: 18px;
	font-family: 'TradeGothic20';
	color: #fff;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	padding-left: 1.5rem;
`

const GraphContainer = styled.div`
	width: calc(100% - 12rem);
	position: relative;
	margin: 4rem auto 0 7rem;
	flex: 1;
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

const BarsContainer = styled.div<{ cols: number }>(({ cols }) => ({
	display: "grid",
	gridTemplateColumns: `repeat(${cols}, 1fr)`,
	width: "100%",
	height: "100%",

	"&&": {
		marginLeft: 0,
	},
}))

const InfoContainer = styled.div`
	flex: 0.5;
	text-align: left;
	margin: 2vh auto 2vh 7rem;
	width: calc(100% - 12rem);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`

const InfoGrid = styled.div<{ cols: number }>(({ cols }) => ({
	display: "grid",
	gridTemplateColumns: `repeat(${cols}, 1fr)`,
	"&&": {
		marginLeft: 0,
	},
}))

const LeverageContainer = styled.div`
	position: relative;
	width: 100%;
	padding: 0.5rem 0;
`

export default Graph

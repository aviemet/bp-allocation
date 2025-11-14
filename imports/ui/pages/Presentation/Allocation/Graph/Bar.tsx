import styled from "@emotion/styled"
import numeral from "numeral"
import { COLORS } from "/imports/lib/global"
import { type OrgDataWithComputed } from "/imports/api/hooks"
import { type ThemeData } from "/imports/api/db"

interface AwardImgProps {
	show: boolean
}

const AwardImg = ({ show }: AwardImgProps) => {
	if(show !== true) return <></>
	return <Award src="/img/BAT_award_logo.svg" style={ { maxHeight: "10rem" } } />
}

interface BarProps {
	org: OrgDataWithComputed
	theme: ThemeData
	savesVisible: boolean
}

const Bar = (props: BarProps) => {
	let shownFunds = props.org.allocatedFunds + (props.org.leverageFunds || 0)
	if(!props.savesVisible) shownFunds -= props.org.save

	let height = Math.min(Math.round((shownFunds / props.org.ask) * 100), 100)
	let backgroundColor = height === 100 ? COLORS.green : COLORS.blue

	if(height === 0) {
		return <BarContainer />
	}

	return (
		<BarContainer>
			<AwardImg show={ height === 100 } />
			<GraphBar style={ { height: `${height}%`, backgroundColor: backgroundColor } }>
				<Pledged>{ numeral(shownFunds).format("$0,0") }</Pledged>
			</GraphBar>
		</BarContainer>
	)
}

const BarContainer = styled.div`
	height: 100%;
	padding: 0 2vw;
	text-align: center;
	display: flex;
	flex-direction: column-reverse;
	position: relative;
`

const GraphBar = styled.div`
	background-color: ${COLORS.blue};

	animation: animate-bar 4s 1 ease-out;
	transition: height 4s ease-out,
	            background-color 5s ease-in;
`

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

	animation: reveal-amount .8s ease 4s;
	-webkit-animation: reveal-amount .5s ease 4s;
	animation-fill-mode: forwards;
	-webkit-animation-fill-mode: forwards;
`

const Award = styled.img`
	position: absolute;
	width: 50%;
	opacity: 0;
	top: 3vh;
	left: 50%;
	transform: translateX(-50%);

	animation: reveal-winner-logo .8s ease 4s;
	-webkit-animation: reveal-winner-logo .5s ease 4s;
	animation-fill-mode: forwards;
	-webkit-animation-fill-mode: forwards;
`

export default Bar

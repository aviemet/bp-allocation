import styled from "@emotion/styled"
import { LinearProgress } from "@mui/material"
import numeral from "numeral"

import { COLORS } from "/imports/lib/global"

interface LeverageBarProps {
	value?: number
	total?: number
}

const LeverageBar = ({ value, total }: LeverageBarProps) => {
	return (
		<LeverageBarContainer>
			<LinearProgress variant="determinate"
				value={ Math.floor((value / total) * 100) }
				total={ total }
				sx={ {
					height: "2.5rem",
					backgroundColor: COLORS.blue,
					"& .MuiLinearProgress-bar": {
						backgroundColor: COLORS.green,
					},
				} }
			/>
			<LeverageCount>${ numeral(value).format("0.00a") }</LeverageCount>
		</LeverageBarContainer>
	)
}

const LeverageBarContainer = styled.div`
	padding-bottom: 5vh;
`

const LeverageCount = styled.div`
	position: absolute;
	color: #FFF;
	height: 100%;
	width: 100%;
	font-size: 2em;
	top: 0;
	display: flex;
	justify-content: center;
	align-items: baseline;
	padding-top: 6px;
`

export default LeverageBar

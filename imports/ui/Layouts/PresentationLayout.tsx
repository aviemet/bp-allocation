import styled from "@emotion/styled"
import React from "react"

interface PresentationLayoutProps {
	children: React.ReactNode
}

const PresentationLayout = ({ children }: PresentationLayoutProps) => {
	return (
		<PresentationContainer id="presentationContainer">{ children }</PresentationContainer>
	)
}

const PresentationContainer = styled.div`
	background: #000;
	width: 100%;
	flex: 1;
	display: flex;
	min-height: 100%;
	color: #FFF;
	text-align: center;
	font-size: 16px;
	font-family: 'BentonMod';

  h2 {
		letter-spacing: 1px;
		color: white;
		text-transform: uppercase;
		font-size: 3.75em;
		font-family: 'TradeGothic';
	}
`

export default PresentationLayout

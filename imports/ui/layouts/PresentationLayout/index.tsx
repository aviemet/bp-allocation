import styled from "@emotion/styled"
import { type ReactNode } from "react"

interface PresentationLayoutProps {
	children: ReactNode
}

export const PresentationLayout = ({ children }: PresentationLayoutProps) => {
	return (
		<PresentationContainer id="presentationContainer">{ children }</PresentationContainer>
	)
}

const PresentationContainer = styled.div`
	background: #000;
	width: 100%;
	height: 100dvh;
	max-height: 100dvh;
	display: flex;
	overflow: hidden;
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

import Paper from "@mui/material/Paper"
import { styled, keyframes } from "@mui/material/styles"
import numeral from "numeral"
import { useLayoutEffect, useRef } from "react"

import { AwardEmblem } from "./AwardEmblem"
import { type OrgDataWithComputed } from "/imports/api/hooks"
import { COLORS } from "/imports/lib/presentation/global"

export type AwardType = "awardee" | "other"

interface AwardCardProps {
	org: OrgDataWithComputed
	award?: AwardType
	amount?: number
	small?: boolean
	shouldPulse?: boolean
}

export const AwardCard = ({ org, award, amount, small, shouldPulse }: AwardCardProps) => {
	const totalFunds = (org.allocatedFunds || 0) + (org.leverageFunds || 0)
	const titleWrapRef = useRef<HTMLDivElement>(null)
	const titleRef = useRef<HTMLParagraphElement>(null)

	useLayoutEffect(() => {
		const wrap = titleWrapRef.current
		const titleElement = titleRef.current
		if(!wrap || !titleElement) {
			return
		}
		if(!org.title) {
			titleElement.style.fontSize = small ? "1.25rem" : "1.7rem"
			return
		}

		const fitTitleFontSize = () => {
			const maxHeight = wrap.clientHeight
			if(maxHeight <= 0) {
				return
			}
			const maxFontRem = small ? 1.25 : 1.7
			const minFontRem = 0.55
			titleElement.style.fontSize = `${maxFontRem}rem`
			if(titleElement.scrollHeight <= maxHeight) {
				return
			}
			let low = minFontRem
			let high = maxFontRem
			while(high - low > 0.04) {
				const mid = (low + high) / 2
				titleElement.style.fontSize = `${mid}rem`
				if(titleElement.scrollHeight <= maxHeight) {
					low = mid
				} else {
					high = mid
				}
			}
			titleElement.style.fontSize = `${low}rem`
		}

		fitTitleFontSize()
		const resizeObserver = new ResizeObserver(fitTitleFontSize)
		resizeObserver.observe(wrap)
		return () => {
			resizeObserver.disconnect()
		}
	}, [org.title, small])

	return (
		<OrgCard className={ `${small ? "small" : ""} ${award === "awardee" ? "awardee" : ""} ${shouldPulse ? "pulse" : ""}`.trim() }>
			<CardImage className={ small ? "small" : "" }>
				<AwardEmblem
					type={ award }
					amount={ amount ?
						numeral(amount).format("$0.[0]a") :
						totalFunds
					}
				/>
			</CardImage>
			<TitleBox ref={ titleWrapRef }>
				<OrgTitle ref={ titleRef }>{ org.title }</OrgTitle>
			</TitleBox>
		</OrgCard>
	)
}

const pulseAnimation = keyframes`
	0%, 100% {
		transform: scale(1.02);
	}
	50% {
		transform: scale(1.075);
	}
`

const OrgCard = styled(Paper)`
	text-align: center;
	background-color: ${COLORS.green};
	border-radius: 0;
	flex-basis: 260px;
	width: 260px;
	height: 275px;
	margin: 0.5em 0.5em;
	display: flex;
	flex-direction: column;

	&.small {
		flex-basis: 200px;
		width: 200px;
		height: 205px;
	}

	&.awardee {
		transform: scale(1.05);
	}

	&.pulse {
		animation: ${pulseAnimation} 10s ease-in-out infinite;
	}
`

const OrgTitle = styled("p")`
	font-family: TradeGothic;
	margin: 0;
	font-weight: 600;
	text-align: center;
	color: #fff;
	line-height: 1.12;
	overflow-wrap: anywhere;
	hyphens: auto;
`

const CardImage = styled("div")`
	width: 100%;
	flex-shrink: 0;
	height: 185px;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;

	&.small {
		height: 140px;
	}
`

const TitleBox = styled("div")`
	flex: 1;
	min-height: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	padding: 4px 6px 6px;
`

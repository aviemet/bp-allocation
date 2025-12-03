import Paper from "@mui/material/Paper"
import { styled, keyframes } from "@mui/material/styles"
import numeral from "numeral"

import AwardEmblem from "../AwardEmblem"
import { type OrgDataWithComputed } from "/imports/api/hooks"
import { COLORS } from "/imports/lib/global"

export type AwardType = "awardee" | "other"

interface AwardCardProps {
	org: OrgDataWithComputed
	award?: AwardType
	amount?: number
	small?: boolean
	shouldPulse?: boolean
}

const AwardCard = ({ org, award, amount, small, shouldPulse }: AwardCardProps) => {
	const totalFunds = (org.allocatedFunds || 0) + (org.leverageFunds || 0)

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
			<CardContent style={ { paddingTop: "4px" } }>
				<OrgTitle className={ small ? "small" : "" }>{ org.title }</OrgTitle>
			</CardContent>
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
	font-size: 1.7rem;
	margin: 5px;
	font-weight: 600;

	&.small {
		font-size: 1.25rem;
	}
`

const CardImage = styled("div")`
	width: 100%;
	height: 185px;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;

	&.small {
		height: 140px;
	}
`

const CardContent = styled("div")`
	color: #FFF;
	text-align: center;
`

export default AwardCard

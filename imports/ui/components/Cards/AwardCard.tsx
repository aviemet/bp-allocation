import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import numeral from "numeral"

import AwardEmblem from "../AwardEmblem"
import { type OrgData } from "/imports/api/db"
import { COLORS } from "/imports/lib/global"

export type AwardType = "awardee" | "other"

interface AwardCardProps {
	org: OrgData & { allocatedFunds?: number }
	award?: AwardType
	amount?: number
}

const AwardCard = ({ org, award, amount }: AwardCardProps) => {
	const totalFunds = (org.allocatedFunds || 0) + (org.leverageFunds || 0)

	return (
		<OrgCard>
			<CardImage>
				<AwardEmblem
					type={ award }
					amount={ amount ?
						numeral(amount).format("$0.[0]a") :
						totalFunds
					}
				/>
			</CardImage>
			<CardContent style={ { paddingTop: "4px" } }>
				<OrgTitle>{ org.title }</OrgTitle>
			</CardContent>
		</OrgCard>
	)
}

const OrgCard = styled(Paper)`
	text-align: center;
	background-color: ${COLORS.green};
	border-radius: 0;
	flex-basis: 290px;
	width: 290px;
	height: 295px;
	margin: 0.5em 0.5em;
`

const OrgTitle = styled("p")`
	font-family: TradeGothic;
	font-size: 1.75rem;
	margin: 5px;
	font-weight: 600;
`

const CardImage = styled("div")`
	width: 100%;
	height: 205px;
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
`

const CardContent = styled("div")`
	color: #FFF;
	text-align: center;
`

export default AwardCard

import styled from "@emotion/styled"
import numeral from "numeral"
import { residualNeed } from "/imports/lib/allocation/displayTotals"
import { type OrgDataWithComputed } from "/imports/api/hooks"

interface OrgInfoProps {
	org: OrgDataWithComputed
	showLeverage: boolean
}

export const OrgInfo = ({ org, showLeverage }: OrgInfoProps) => {
	const need = residualNeed(org.need, org.leverageFunds)
	return (
		<InfoContainer className="orginfo">
			<Title>{ org.title }</Title>

			<TotalNeed>
				Need: { need > 0 ? `$${numeral(need).format("0,0[a]")}` : "--" }
			</TotalNeed>

			{ showLeverage &&
				<MatchNeed>
					Match Need: { need > 0 ? `$${numeral(need / 2).format("0,0[a]")}` : "--" }
				</MatchNeed>
			}

		</InfoContainer>
	)
}

const InfoContainer = styled.div`
	container-type: inline-size;
	&& {
		margin: 0 1rem;
		text-align: center;
		font-size: clamp(0.8rem, 10cqw, 2rem);
		line-height: clamp(0.8rem, 10cqw, 2rem);
	}
`

const Title = styled.div`
	min-height: 60px;
	font-size: clamp(0.9rem, 15cqw, 3rem);
	line-height: clamp(0.9rem, 15cqw, 3rem);
	overflow-wrap: anywhere;
	hyphens: auto;
`

const MatchNeed = styled.div`
	color: #c31a1a;
`

const TotalNeed = styled.div`
	color: #00853f;
`


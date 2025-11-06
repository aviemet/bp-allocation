import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import numeral from "numeral"
import { type OrgStore } from "/imports/api/stores"

interface OrgInfoProps {
	org: OrgStore
	showLeverage: boolean
}

const OrgInfo = observer(({ org, showLeverage }: OrgInfoProps) => {
	const need = org.need - org.leverageFunds
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
})

const InfoContainer = styled.div`
	&& {
		margin: 0 1rem;
		text-align: center;
		font-size: clamp(1.4rem, 0.4265rem + 1.2715vw, 2rem);
		line-height: clamp(1.4rem, 0.4265rem + 1.2715vw, 2rem);
	}
`

const Title = styled.div`
	min-height: 60px;
	font-size: clamp(1.5rem, -0.9338rem + 3.1788vw, 3rem);
	line-height: clamp(1.5rem, -0.9338rem + 3.1788vw, 3rem);
`

const MatchNeed = styled.div`
	color: #c31a1a;
`

const TotalNeed = styled.div`
	color: #00853f;
`

export default OrgInfo

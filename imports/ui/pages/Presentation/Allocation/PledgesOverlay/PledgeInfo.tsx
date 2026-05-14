import styled from "@emotion/styled"
import numeral from "numeral"
import { useMembers, type PledgeWithOrg, getFormattedName } from "/imports/api/hooks"

interface PledgeInfoProps {
	pledge: PledgeWithOrg
}

export const PledgeInfo = ({ pledge }: PledgeInfoProps) => {
	const { members, membersLoading } = useMembers()

	if(membersLoading || !members || !pledge || !pledge.org) {
		return <></>
	}

	const member = pledge.anonymous ? undefined : members.find(mem => mem._id === pledge.member)

	return (
		<AnimationContainer>
			<AnimationContent>
				<h1 className="memberName">{ member && getFormattedName(member) }</h1>
				<h1 className="orgTitle">{ pledge.org.title }</h1>
				<h1 className="amount">{ numeral(pledge.amount).format("$0,0") }</h1>
			</AnimationContent>
		</AnimationContainer>
	)
}

const AnimationContainer = styled.div`
	position: fixed;
	inset: 0;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: visible;
	box-sizing: border-box;
	padding: max(0.5rem, env(safe-area-inset-top, 0px)) max(0.75rem, env(safe-area-inset-right, 0px))
		max(0.5rem, env(safe-area-inset-bottom, 0px)) max(0.75rem, env(safe-area-inset-left, 0px));

	h1 {
		margin: 0;
		line-height: 1.2;
		font-family: Roboto;
		-webkit-text-stroke: 4px #000;
		-webkit-text-fill-color: white;
		paint-order: stroke fill;
		text-shadow:
			0 0.06em 0.14em rgba(0, 0, 0, 0.95),
			0 0.12em 0.28em rgba(0, 0, 0, 0.85),
			0 0 0.08em rgba(0, 0, 0, 1),
			4px 5px 0 rgba(0, 0, 0, 0.75),
			6px 8px 18px rgba(0, 0, 0, 0.65),
			-4px 3px 14px rgba(254, 96, 28, 0.55),
			5px -3px 16px rgba(235, 219, 20, 0.45),
			-3px -4px 18px rgba(19, 194, 218, 0.5),
			6px 5px 20px rgba(213, 68, 255, 0.45),
			-6px 6px 22px rgba(50, 225, 111, 0.35),
			3px 2px 12px rgba(153, 153, 255, 0.65),
			0 0 28px rgba(241, 91, 10, 0.3);
		font-weight: 700;
		text-align: center;

		&.memberName {
			font-size: 7.75rem;
		}

		&.orgTitle {
			font-size: 7.75rem;
		}

		&.amount {
			font-size: 9.5rem;
		}
	}
`

const AnimationContent = styled.div`
	opacity: 0;
	animation: fade-in-scroll-up 10s;
	text-align: center;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.35em;
`


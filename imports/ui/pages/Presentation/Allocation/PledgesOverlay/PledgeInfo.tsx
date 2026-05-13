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
	overflow: hidden;
	box-sizing: border-box;
	padding: max(0.5rem, env(safe-area-inset-top, 0px)) max(0.75rem, env(safe-area-inset-right, 0px))
		max(0.5rem, env(safe-area-inset-bottom, 0px)) max(0.75rem, env(safe-area-inset-left, 0px));

	h1 {
		margin: 0;
		line-height: 1.08;
		font-family: Roboto;
		-webkit-text-stroke: 3px #000;
		-webkit-text-fill-color: white;
		paint-order: stroke fill;
		text-shadow: 2px 3px 1px #99F;
		font-weight: 700;
		text-align: center;
		overflow-wrap: anywhere;

		&.memberName {
			font-size: clamp(1.25rem, 6.5vmin, 6.5rem);
		}

		&.orgTitle {
			font-size: clamp(1.25rem, 6.5vmin, 6.5rem);
		}

		&.amount {
			font-size: clamp(1.5rem, 8vmin, 8rem);
		}
	}
`

const AnimationContent = styled.div`
	opacity: 0;
	animation: fade-in-scroll-up 10s;
	text-align: center;
	max-width: 100%;
	box-sizing: border-box;
`


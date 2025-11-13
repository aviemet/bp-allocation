import styled from "@emotion/styled"
import numeral from "numeral"
import { useMembers, type PledgeWithOrg, getFormattedName } from "/imports/api/hooks"

interface PledgeInfoProps {
	pledge: PledgeWithOrg
}

const PledgeInfo = ({ pledge }: PledgeInfoProps) => {
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
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;

	h1 {
		font-family: Roboto;
		-webkit-text-stroke: 3px #000;
		-webkit-text-fill-color: white;
		paint-order: stroke fill;
		text-shadow: 2px 3px 1px #99F;
		font-weight: 700;

		&.memberName {
			font-size: 6.5rem;
		}

		&.orgTitle {
			font-size: 6.5rem;
		}

		&.amount {
			font-size: 8rem;
		}
	}
`

const AnimationContent = styled.div`
	opacity: 0;
	animation: fade-in-scroll-up 10s;
`

export default PledgeInfo

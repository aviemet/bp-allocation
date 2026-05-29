import styled from "@emotion/styled"
import numeral from "numeral"
import { type previewMatchedPrincipal } from "/imports/lib/allocation/pledgeMatching"

interface PledgeMatchHintMessageProps {
	orgTitle: string
	pledgeAmount: number
	orgNeed: number
	preview: NonNullable<ReturnType<typeof previewMatchedPrincipal>>
}

const pledgeMatchHintWorthShowing = (
	preview: PledgeMatchHintMessageProps["preview"],
): boolean =>
	preview.overNeedNoMatch
	|| preview.orgFullyFunded
	|| preview.poolExhausted
	|| preview.askLimited
	|| preview.poolLimited

export function PledgeMatchHintMessage({
	orgTitle,
	pledgeAmount,
	orgNeed,
	preview,
}: PledgeMatchHintMessageProps) {
	if(!pledgeMatchHintWorthShowing(preview)) {
		return null
	}

	const formattedMatch = numeral(preview.leverageBonus).format("$0,0")
	const formattedNeed = numeral(orgNeed).format("$0,0")
	const formattedPledge = numeral(pledgeAmount).format("$0,0")

	// Pledge alone meets or exceeds remaining need — no leverage on top.
	if(preview.overNeedNoMatch) {
		return (
			<MatchHint>
				{ orgTitle } only needs { formattedNeed } to be fully funded. At { formattedPledge }, your pledge covers that gap, so it will not receive leverage matching.
			</MatchHint>
		)
	}

	// Org already at or past fully funded — no leverage on pledges.
	if(preview.orgFullyFunded) {
		return (
			<MatchHint>
				{ orgTitle } is already fully funded. Your generous pledge will be greatly appreciated, but not matched.
			</MatchHint>
		)
	}

	// Leverage pool has nothing left for this pledge.
	if(preview.poolExhausted) {
		return (
			<MatchHint>
				All of the remaining leverage pool has been allocated! Your generous pledge will be greatly appreciated, but not matched.
			</MatchHint>
		)
	}

	// Partial match: pledge is less than need but full-ratio bonus would overshoot fully funded.
	if(preview.askLimited && !preview.poolLimited) {
		return (
			<MatchHint>
				Your generous donation will be matched at { formattedMatch }, causing { orgTitle } to be fully funded!
			</MatchHint>
		)
	}

	// Partial match: ask allows more but leverage pool is exhausted.
	if(preview.poolLimited) {
		return (
			<MatchHint>
				Matching your generous donation would use all of what remains in the leverage pool. It will receive a match of { formattedMatch } instead.
			</MatchHint>
		)
	}

	return null
}

const MatchHint = styled.p`
	text-align: center;
	font-size: 1rem;
	margin: 0 0 0.5rem 0;
`

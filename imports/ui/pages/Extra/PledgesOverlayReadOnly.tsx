import styled from "@emotion/styled"
import { type PledgeWithOrg } from "/imports/api/hooks"

import { PledgeDisplay } from "/imports/ui/pages/Presentation/Allocation/PledgesOverlay/PledgeDisplay"

interface PledgesOverlayReadOnlyProps {
	pledge: PledgeWithOrg
}

export const PledgesOverlayReadOnly = ({ pledge }: PledgesOverlayReadOnlyProps) => {
	return (
		<OverlayContainer>
			<PledgeDisplay pledge={ pledge } />
		</OverlayContainer>
	)
}

const OverlayContainer = styled.div`
	position: fixed;
	inset: 0;
	overflow: hidden;
	pointer-events: none;
	box-sizing: border-box;
`


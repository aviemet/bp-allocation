import styled from "@emotion/styled"
import { type PledgeWithOrg } from "/imports/api/hooks"

import PledgeDisplay from "/imports/ui/pages/Presentation/Allocation/PledgesOverlay/PledgeDisplay"

interface PledgesOverlayReadOnlyProps {
	pledge: PledgeWithOrg
}

const PledgesOverlayReadOnly = ({ pledge }: PledgesOverlayReadOnlyProps) => {
	return (
		<OverlayContainer>
			<PledgeDisplay pledge={ pledge } />
		</OverlayContainer>
	)
}

const OverlayContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	pointer-events: none;
`

export default PledgesOverlayReadOnly

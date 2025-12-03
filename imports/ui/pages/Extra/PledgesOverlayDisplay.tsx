import styled from "@emotion/styled"
import { useOrgs, usePledgeAnimationQueue } from "/imports/api/hooks"
import { useEffect, useState } from "react"

import PledgesOverlayReadOnly from "./PledgesOverlayReadOnly"
import { type PledgeWithOrg } from "/imports/api/hooks"
import { convertPledgeToPlainObject } from "/imports/ui/pages/Presentation/Allocation/PledgesOverlay/utils"

const PledgesOverlayDisplay = () => {
	const { pledges } = useOrgs()
	const { queueItems } = usePledgeAnimationQueue()
	const [ currentPledge, setCurrentPledge ] = useState<PledgeWithOrg | null>(null)

	useEffect(() => {
		if(queueItems.length === 0) {
			setCurrentPledge(null)
			return
		}

		const queueItem = queueItems[0]
		const pledge = pledges?.find(p => p._id === queueItem.pledgeId)
		if(!pledge) {
			setCurrentPledge(null)
			return
		}

		setCurrentPledge(convertPledgeToPlainObject(pledge))
	}, [queueItems, pledges])

	return (
		<PageContainer>
			{ currentPledge && <PledgesOverlayReadOnly pledge={ currentPledge } /> }
		</PageContainer>
	)
}

const PageContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	background-color: #000;
	overflow: hidden;
	margin: 0;
	padding: 0;
`

export default PledgesOverlayDisplay

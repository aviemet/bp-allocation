import styled from "@emotion/styled"
import { useOrgs, usePledgeAnimationQueue } from "/imports/api/hooks"
import { useEffect, useMemo } from "react"

import { PledgesOverlayReadOnly } from "./PledgesOverlayReadOnly"
import { type PledgeWithOrg } from "/imports/api/hooks"
import { convertPledgeToPlainObject } from "/imports/ui/pages/Presentation/Allocation/PledgesOverlay/utils"

export const PledgesOverlayDisplay = () => {
	const { pledges } = useOrgs()
	const { queueItems } = usePledgeAnimationQueue()
	const currentPledge = useMemo((): PledgeWithOrg | null => {
		if(queueItems.length === 0) {
			return null
		}
		const queueItem = queueItems[0]
		const pledge = pledges?.find(p => p._id === queueItem.pledgeId)
		if(!pledge) {
			return null
		}
		return convertPledgeToPlainObject(pledge)
	}, [queueItems, pledges])

	useEffect(() => {
		const previousHtmlOverflow = document.documentElement.style.overflow
		const previousBodyOverflow = document.body.style.overflow
		document.documentElement.style.overflow = "hidden"
		document.body.style.overflow = "hidden"
		return () => {
			document.documentElement.style.overflow = previousHtmlOverflow
			document.body.style.overflow = previousBodyOverflow
		}
	}, [])

	return (
		<PageContainer>
			{ currentPledge && <PledgesOverlayReadOnly pledge={ currentPledge } /> }
		</PageContainer>
	)
}

const PageContainer = styled.div`
	position: fixed;
	inset: 0;
	background-color: #000;
	overflow: hidden;
	margin: 0;
	padding: 0;
	box-sizing: border-box;
`

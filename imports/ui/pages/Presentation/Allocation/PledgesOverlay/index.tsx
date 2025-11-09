import styled from "@emotion/styled"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { useOrgs } from "/imports/api/providers"
import { observer } from "mobx-react-lite"
import { useEffect, useRef, useState } from "react"

import PledgeDisplay from "./PledgeDisplay"
import { PledgeAnimationQueue } from "/imports/api/db/PledgeAnimationQueue"
import { type PledgeWithOrg } from "/imports/api/stores/OrgsCollection"
import { convertPledgeToPlainObject } from "./utils"
import PledgeAnimationMethods from "/imports/api/methods/PledgeAnimationMethods"

const PledgesOverlay = observer(() => {
	const { orgs } = useOrgs()

	const [ currentPledge, setCurrentPledge ] = useState<PledgeWithOrg | null>(null)
	const [ isAnimating, setIsAnimating ] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const initializedPledgeIds = useRef<Set<string>>(new Set())

	useEffect(() => {
		if(!orgs?.pledges) return

		if(initializedPledgeIds.current.size === 0) {
			orgs.pledges.forEach(p => initializedPledgeIds.current.add(p._id))
			return
		}

		orgs.pledges.forEach(pledge => {
			if(!initializedPledgeIds.current.has(pledge._id)) {
				initializedPledgeIds.current.add(pledge._id)
				PledgeAnimationMethods.enqueuePledgeAnimation.callAsync({
					pledgeId: pledge._id,
					orgId: pledge.org._id,
					orgTitle: pledge.org.title,
				})
			}
		})
	}, [orgs?.pledges])

	const queueItems = useTracker(() => {
		Meteor.subscribe("pledgeAnimationQueue")
		return PledgeAnimationQueue.find({}, { sort: { timestamp: 1 } }).fetch()
	}, [])

	useEffect(() => {
		if(isAnimating || queueItems.length === 0) return

		const queueItem = queueItems[0]
		const pledge = orgs?.pledges.find(p => p._id === queueItem.pledgeId)
		if(!pledge) return

		setIsAnimating(true)
		setCurrentPledge(convertPledgeToPlainObject(pledge))

		timerRef.current = setTimeout(async () => {
			await PledgeAnimationMethods.markProcessed.callAsync({ queueItemId: queueItem._id })
			setCurrentPledge(null)
			setIsAnimating(false)
		}, 10000)
	}, [queueItems.length, isAnimating, orgs?.pledges, queueItems])

	useEffect(() => {
		return () => {
			if(timerRef.current) {
				clearTimeout(timerRef.current)
			}
		}
	}, [])

	return (
		<OverlayContainer>
			{ currentPledge && <PledgeDisplay pledge={ currentPledge } /> }
		</OverlayContainer>
	)
})

const OverlayContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	pointer-events: none;
`

export default PledgesOverlay

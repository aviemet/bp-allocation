import styled from "@emotion/styled"
import { useOrgs, usePledgeAnimationQueue, useTheme } from "/imports/api/hooks"
import { useEffect, useRef, useState } from "react"

import { PledgeDisplay } from "./PledgeDisplay"
import { type PledgeWithOrg } from "/imports/api/hooks"
import { convertPledgeToPlainObject } from "./utils"
import { PledgeAnimationMethods } from "/imports/api/methods/PledgeAnimationMethods"

export const PledgesOverlay = () => {
	const { pledges } = useOrgs()
	const { queueItems } = usePledgeAnimationQueue()
	const { theme } = useTheme()

	const [ currentPledge, setCurrentPledge ] = useState<PledgeWithOrg | null>(null)
	const [ isAnimating, setIsAnimating ] = useState(false)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const initializedPledgeIds = useRef<Set<string>>(new Set())
	const committedHeadIdRef = useRef<string | undefined>(undefined)

	useEffect(() => {
		if(!pledges || !theme) return

		if(initializedPledgeIds.current.size === 0) {
			pledges.forEach(p => initializedPledgeIds.current.add(p._id))
			return
		}

		pledges.forEach(pledge => {
			if(!initializedPledgeIds.current.has(pledge._id)) {
				initializedPledgeIds.current.add(pledge._id)
				PledgeAnimationMethods.enqueuePledgeAnimation.callAsync({
					themeId: theme._id,
					pledgeId: pledge._id,
					orgId: pledge.org._id,
					orgTitle: pledge.org.title,
				})
			}
		})
	}, [pledges, theme])

	useEffect(() => {
		const item = queueItems[0]
		const headId = item?._id
		const pledge = item?.pledgeId ? pledges?.find(p => p._id === item.pledgeId) : undefined

		if(committedHeadIdRef.current !== undefined && headId !== committedHeadIdRef.current) {
			if(timerRef.current) {
				clearTimeout(timerRef.current)
				timerRef.current = null
			}
			committedHeadIdRef.current = undefined
			setCurrentPledge(null)
			setIsAnimating(false)
		}

		if(!item || !pledge) return
		if(isAnimating) return
		if(committedHeadIdRef.current === headId) return

		committedHeadIdRef.current = headId

		setIsAnimating(true)
		setCurrentPledge(convertPledgeToPlainObject(pledge))

		timerRef.current = setTimeout(async () => {
			await PledgeAnimationMethods.markProcessed.callAsync({ queueItemId: item._id })
			setCurrentPledge(null)
			setIsAnimating(false)
		}, 10000)
	}, [queueItems, pledges, isAnimating])

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
}

const OverlayContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	pointer-events: none;
`

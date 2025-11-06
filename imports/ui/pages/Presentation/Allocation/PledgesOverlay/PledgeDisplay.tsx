import Fireworks from "matter-fireworks"
import { useLayoutEffect, useRef } from "react"

import PledgeInfo from "./PledgeInfo"
import { type MatchPledge } from "/imports/types/schema"
import { type OrgStore } from "/imports/api/stores"

interface PledgeDisplayProps {
	pledge: MatchPledge & { org: OrgStore }
}

const PledgeDisplay = ({ pledge }: PledgeDisplayProps) => {
	const canvasRef = useRef()
	let fireworks
	let numFireworks = 4
	if(pledge.amount > 10000) numFireworks++
	if(pledge.amount > 50000) numFireworks++
	if(pledge.amount > 100000) numFireworks += 2

	useLayoutEffect(() => {
		fireworks = new Fireworks(canvasRef.current)
		fireworks.fire(numFireworks, numFireworks * 750)
	})

	return (
		<>
			<PledgeInfo pledge={ pledge } />
			<canvas ref={ canvasRef } />
		</>
	)
}

export default PledgeDisplay

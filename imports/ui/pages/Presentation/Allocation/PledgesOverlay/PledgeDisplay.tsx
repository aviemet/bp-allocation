import Fireworks from "matter-fireworks"
import { useLayoutEffect, useRef } from "react"

import PledgeInfo from "./PledgeInfo"
import { type PledgeWithOrg } from "/imports/api/hooks"

interface PledgeDisplayProps {
	pledge: PledgeWithOrg
}

const PledgeDisplay = ({ pledge }: PledgeDisplayProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	let numFireworks = 4
	if(pledge.amount > 10000) numFireworks++
	if(pledge.amount > 50000) numFireworks++
	if(pledge.amount > 100000) numFireworks += 2

	useLayoutEffect(() => {
		if(!canvasRef.current) return
		const fireworks = new Fireworks(canvasRef.current)
		fireworks.fire(numFireworks, numFireworks * 750)
	}, [numFireworks])

	return (
		<>
			<PledgeInfo pledge={ pledge } />
			<canvas ref={ canvasRef } />
		</>
	)
}

export default PledgeDisplay

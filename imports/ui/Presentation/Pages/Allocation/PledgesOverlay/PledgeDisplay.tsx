import React, { useLayoutEffect, useRef } from 'react'
import PledgeInfo from './PledgeInfo'
import Fireworks from 'matter-fireworks' // personal package

const PledgeDisplay = ({ pledge }: { pledge: MatchPledge }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

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

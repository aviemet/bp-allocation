import styled from "@emotion/styled"
import Fireworks from "matter-fireworks"
import { useLayoutEffect, useRef } from "react"

import { PledgeInfo } from "./PledgeInfo"
import { type PledgeWithOrg } from "/imports/api/hooks"

interface PledgeDisplayProps {
	pledge: PledgeWithOrg
}

const FIREWORKS_SPREAD_MS_PER_UNIT = 820

export const PledgeDisplay = ({ pledge }: PledgeDisplayProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	let numFireworks = 4
	if(pledge.amount > 10000) numFireworks++
	if(pledge.amount > 50000) numFireworks++
	if(pledge.amount > 100000) numFireworks += 2

	useLayoutEffect(() => {
		if(!canvasRef.current) return
		const fireworks = new Fireworks(canvasRef.current)
		fireworks.fire(numFireworks, numFireworks * FIREWORKS_SPREAD_MS_PER_UNIT)
	}, [numFireworks])

	return (
		<>
			<FireworksCanvasLayer>
				<canvas ref={ canvasRef } />
			</FireworksCanvasLayer>
			<PledgeInfo pledge={ pledge } />
		</>
	)
}

const FireworksCanvasLayer = styled.div`
	position: fixed;
	inset: 0;
	z-index: 0;
	overflow: hidden;
	pointer-events: none;
	box-sizing: border-box;
`


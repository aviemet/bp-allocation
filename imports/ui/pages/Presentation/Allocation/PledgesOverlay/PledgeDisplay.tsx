import Fireworks from "matter-fireworks"
import PropTypes from "prop-types"
import { useLayoutEffect, useRef } from "react"

import PledgeInfo from "./PledgeInfo"


const PledgeDisplay = ({ pledge }) => {
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

PledgeDisplay.propTypes = {
	pledge: PropTypes.object,
}

export default PledgeDisplay

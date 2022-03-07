import React from 'react'

import styled from '@emotion/styled'

import Simulation from '/imports/ui/Admin/Simulation'

const Graph = (props) => {
	return (
		<React.Fragment>
			<SimulationContainer>
				<Simulation />
			</SimulationContainer>
		</React.Fragment>
	)
}

const SimulationContainer = styled.div`
	width: 100%;
	background-color: #000;
	display: block;

	#graph, #info {
		margin-left: 5em;
	}
`

export default Graph

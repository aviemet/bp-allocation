import styled from "@emotion/styled"
import React from "react"

import Allocation from "/imports/ui/pages/Presentation/Allocation"

const Presentation = () => {
	return (
		<SimulationContainer>
			<Allocation simulation={ true } />
		</SimulationContainer>
	)
}

const SimulationContainer = styled.div`
	&& #graph{
		margin-top: 6.5em;
	}

	&& .orginfo{
		font-size: 1.1em;
	}
`

export default Presentation

import styled from "@emotion/styled"

import { Allocation } from "/imports/ui/pages/Presentation/Allocation"

export const Simulation = () => {
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

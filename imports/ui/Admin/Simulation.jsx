import React from 'react';

import styled from 'styled-components';

import { Allocation } from '/imports/ui/Presentation/Pages';

const SimulationContainer = styled.div`
	&& #graph{
		margin-top: 6.5em;
	}

	&& .orginfo{
		font-size: 1.1em;
	}
`;

const Presentation = () => {
	return (
		<SimulationContainer>
			<Allocation simulation={ true } />
		</SimulationContainer>
	);
};

export default Presentation;

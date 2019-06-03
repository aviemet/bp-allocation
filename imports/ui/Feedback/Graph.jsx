import React from 'react';

import styled from 'styled-components';

import Simulation from '/imports/ui/Admin/Simulation';

const SimulationContainer = styled.div`
	width: 100%;
	background-color: #000;
	display: block;

	#graph, #info {
		margin-left: 5em;
	}
`;

const Graph = (props) => {
  return (
  	<React.Fragment>
  		<SimulationContainer>
	  		<Simulation />
			</SimulationContainer>
  	</React.Fragment>
  )
}

export default Graph;

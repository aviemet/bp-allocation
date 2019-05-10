import { Meteor } from 'meteor/meteor';
import React from 'react';

import { Loader } from 'semantic-ui-react';
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

const Presentation = props => {
	return (
		<SimulationContainer>
			<Allocation />
		</SimulationContainer>
	);
}

export default Presentation;

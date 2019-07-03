import React from 'react';

import { Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import Graph from '/imports/ui/Presentation/Graph/Graph';

const Allocation = props => {
	return (
		<React.Fragment>
			<Graph simulation={ props.simulation || false } />
		</React.Fragment>
	);
};

export default Allocation;

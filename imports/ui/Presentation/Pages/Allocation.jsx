import React from 'react';

import { Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import Graph from '/imports/ui/Presentation/Graph/Graph';

const Allocation = (props) => {
	return (
		<React.Fragment>
			<Graph theme={props.theme} orgs={props.orgs} />
		</React.Fragment>
	);
}

export default Allocation;

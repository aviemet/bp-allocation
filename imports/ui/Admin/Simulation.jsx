import { Meteor } from 'meteor/meteor';
import React from 'react';

import { Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import { withContext, ThemeContext } from '/imports/api/Context';

import { Allocation } from '/imports/ui/Presentation/Pages';

const SimulationContainer = styled.div`
	&& #graph{
		margin-top: 6.5em;
	}

	&& .orginfo{
		font-size: 1.1em;
	}
`;

const Presentation = (props) => {
	if(props.loading){
		return(<Loader />);
	}
	return (
		<ThemeContext.Consumer>{context => (
			<SimulationContainer>
				<Allocation orgs={context.topOrgs} theme={context.theme} />
			</SimulationContainer>
		)}</ThemeContext.Consumer>
	);
}

export default withContext(Presentation);

import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'underscore';


import { Loader, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { withContext, ThemeContext } from '/imports/ui/Contexts';
import { Themes, Organizations, Images } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

import { Intro, Orgs, Timer, TopOrgs, Allocation, Results } from '/imports/ui/Presentation/Pages';

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

import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'underscore';


import { Loader, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeContext } from '/imports/ui/Contexts';
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

class Presentation extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if(this.props.loading){
			return(<Loader />);
		}
		return (
			<ThemeContext.Provider value={this.props.theme}>
				<SimulationContainer>
					<Allocation orgs={ThemeMethods.filterTopOrgs(this.props.theme, this.props.organizations)} theme={this.props.theme} />
				</SimulationContainer>
			</ThemeContext.Provider>
		);
	}
}

export default withTracker(({id}) => {
	themesHandle = Meteor.subscribe('themes', id);
	orgsHandle = Meteor.subscribe('organizations', id);

	let theme = Themes.find({_id: id}).fetch()[0];
	let orgs = Organizations.find({theme: id}).fetch();

	return {
		loading: !themesHandle.ready() && !orgsHandle.ready(),
		theme: theme,
		organizations: orgs
	};
})(withRouter(Presentation));

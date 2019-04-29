import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import { Loader, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { PresentationLayout } from '/imports/ui/Layouts';

import { withContext } from '/imports/api/Context';
import { Themes, Organizations, Images } from '/imports/api';
import { ThemeMethods, PresentationSettingsMethods } from '/imports/api/methods';

import { Intro, Orgs, Timer, TopOrgs, Allocation, Results } from '/imports/ui/Presentation/Pages';

// Transition group definitions
const FADE_DURATION = 300;

const defaultStyle = {
	transition: `opacity ${FADE_DURATION}ms ease-in-out`,
	opacity: 0
};

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 }
};

const PageFader = styled.div`
	opacity: 0;
`;

class Presentation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			show: true,
			entered: false,
		};
	}

	// TODO: wait for image load before showing page
	doNavigation() {
		let page = `/presentation/${this.props.theme._id}/${this.props.presentationSettings.currentPage}`;
		if(this.props.location.pathname !== page && this.state.show){
			this.setState({ show: false });

			setTimeout(() => {
				this.props.history.push(page);
				this.setState({ show: true });
			}, FADE_DURATION);
		}
	}

	componentDidMount() {
		this.doNavigation();
	}

	componentDidUpdate(prevState, prevProps) {
		this.doNavigation();
	}

	render() {
		if(this.props.loading) {
			return <Loader/>
		}

		const { show } = this.state;
		const path = this.props.match.path;
		const { timerLength, animateOrgs } = this.props.presentationSettings;

		return (
			<Transition in={show} timeout={FADE_DURATION}>
				{(state) => (
				<PageFader style={{...defaultStyle, ...transitionStyles[state]}}>
					{/* Intro */}
					<Route path={`${path}/intro`} component={Intro} />

					{/* Participating Organizations */}
					<Route exact path={`${path}/orgs`} render={(props) => (
						<Orgs orgs={this.props.orgs} topOrgs={this.props.topOrgs} theme={this.props.theme} />
					)}/>

					{/* Timer */}
					<Route exact path={`${path}/timer`} render={(props) => (
						<Timer seconds={timerLength} />
					)} />

					{/* Top Orgs */}
					<Route exact path={`${path}/toporgs`} render={(props) => (
						<TopOrgs orgs={this.props.topOrgs} animate={animateOrgs} />
					)} />

					{/* Allocation */}
					<Route exact path={`${path}/allocation`} render={(props) => (
						<Allocation />
					)} />

					{/* Results */}
					<Route exact path={`${path}/results`} render={(props) => (
						<Results orgs={this.props.topOrgs} theme={this.props.theme} offset={(this.props.presentationSettings.resultsOffset || 0)} />
					)} />
				</PageFader>
				)}
			</Transition>
		);
	}
}

export default withContext(withRouter(Presentation));

// orgs={this.props.topOrgs} theme={this.props.theme}

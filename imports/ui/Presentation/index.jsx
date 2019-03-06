import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Router, Route, Switch, withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import { withTracker } from 'meteor/react-meteor-data';
import _ from 'underscore';

import { Loader, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { PresentationLayout } from '/imports/ui/Layouts';

import { withContext } from '/imports/ui/Contexts';
import { Themes, Organizations, Images } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

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

	doNavigation() {
		let page = `/presentation/${this.props.theme._id}/${this.props.theme.currentPage}`;
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
		const { show } = this.state;
		const path = this.props.match.path;
		return (
			<Transition in={show} timeout={FADE_DURATION}>
				{(state) => (
				<PageFader style={{...defaultStyle, ...transitionStyles[state]}}>
					{/* Intro */}
					<Route path={`${path}/intro`} component={Intro} />

					{/* Participating Organizations */}
					<Route exact path={`${path}/orgs`} render={(props) => (
						<Orgs orgs={this.props.orgs} />
					)}/>

					{/* Timer */}
					<Route exact path={`${path}/timer`} render={(props) => (
						<Timer seconds={this.props.theme.timer_length} />
					)} />

					{/* Top Orgs */}
					<Route exact path={`${path}/toporgs`} render={(props) => (
						<TopOrgs orgs={this.props.getTopOrgs()} animate={this.props.theme.animate_orgs} />
					)} />

					{/* Allocation */}
					<Route exact path={`${path}/allocation`} render={(props) => (
						<Allocation orgs={this.props.getTopOrgs()} theme={this.props.theme} />
					)} />

					{/* Results */}
					<Route exact path={`${path}/results`} render={(props) => (
						<Results orgs={this.props.getTopOrgs()} theme={this.props.theme} />
					)} />
				</PageFader>
				)}
			</Transition>
		);
	}
}

export default withContext(withRouter(Presentation));

// <TopOrgs orgs={this.props.orgs} theme={this.props.theme._id} test={props} />
//
// export default withTracker(({id}) => {
// 	themesHandle = Meteor.subscribe('themes', id);
// 	orgsHandle = Meteor.subscribe('organizations', id);
// 	imagesHandle = Meteor.subscribe('images');
//
// 	let theme = Themes.find({_id: id}).fetch()[0];
// 	let orgs = Organizations.find({theme: id}).fetch();
// 	let images;
//
// 	// Get the image info into the orgs
// 	let imgIds = orgs.map((org) => ( org.image ));
// 	if(!_.isEmpty(imgIds)){
// 		// Fetch the images
// 		images = Images.find({_id: {$in: imgIds}}).fetch();
//
// 		// Map fields from each image object to its respective org
// 		if(!_.isEmpty(images)){
// 			orgs.map((org) => {
// 				image = _.find(images, (img) => ( img._id === org.image));
//
// 				if(image){
// 					org.image = image;
// 				}
// 			});
// 		}
// 	}
//
// 	return {
// 		loading: !themesHandle.ready() && !orgsHandle.ready() && !imagesHandle.ready(),
// 		theme: theme,
// 		organizations: orgs
// 	};
// })(withRouter(PresentationLayout));

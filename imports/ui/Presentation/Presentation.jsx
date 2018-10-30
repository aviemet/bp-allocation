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

// Transition group definitions
const duration = 300;

const defaultStyle = {
	transition: `opacity ${duration}ms ease-in-out`,
	opacity: 0
};

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 }
};

const PageFader = styled.div`
	opacity: 0;
`;

class PresentationLayout extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			show: true,
			entered: false,
		};
	}

	componentDidUpdate(prevProps, prevState){
		let page = `/presentation/${this.props.id}/${this.props.theme.currentPage}`;

		if(this.props.location.pathname !== page && this.state.show){
			this.setState({ show: false });

			setTimeout(() => {
				this.props.history.push(page);
				this.setState({ show: true });
			}, duration);

		}
	}

	render() {
		if(this.props.loading){
			return(<Loader />);
		}
		const { show } = this.state;
		return (
			<ThemeContext.Provider value={this.props.theme}>
				<Transition in={show} timeout={duration}>
					{(state) => (
					<PageFader style={{...defaultStyle, ...transitionStyles[state]}}>
						{/* Intro */}
						<Route exact path={`/presentation/${this.props.id}/intro`} component={Intro} />

						{/* Participating Organizations */}
						<Route exact path={`/presentation/${this.props.id}/orgs`} render={(props) => (
							<Orgs orgs={this.props.organizations} />
						)}/>

						{/* Timer */}
						<Route exact path={`/presentation/${this.props.id}/timer`} render={(props) => (
							<Timer seconds={this.props.theme.timer_length} />
						)} />

						{/* Top Orgs */}
						<Route exact path={`/presentation/${this.props.id}/toporgs`} render={(props) => (
							<TopOrgs orgs={this.props.organizations} theme={this.props.theme} />
						)} />

						{/* Allocation */}
						<Route exact path={`/presentation/${this.props.id}/allocation`} render={(props) => (
							<Allocation orgs={ThemeMethods.filterTopOrgs(this.props.theme, this.props.organizations)} theme={this.props.theme} />
						)} />

						{/* Results */}
						<Route exact path={`/presentation/${this.props.id}/results`} render={(props) => (
							<Results orgs={ThemeMethods.filterTopOrgs(this.props.theme, this.props.organizations)} theme={this.props.theme} />
						)} />
					</PageFader>
					)}
				</Transition>
			</ThemeContext.Provider>
		);
	}
}

export default withTracker(({id}) => {
	themesHandle = Meteor.subscribe('themes', id);
	orgsHandle = Meteor.subscribe('organizations', id);
	imagesHandle = Meteor.subscribe('images');

	let theme = Themes.find({_id: id}).fetch()[0];
	let orgs = Organizations.find({theme: id}).fetch();
	let images;

	// Get the image info into the orgs
	let imgIds = orgs.map((org) => ( org.image ));
	if(!_.isEmpty(imgIds)){
		// Fetch the images
		images = Images.find({_id: {$in: imgIds}}).fetch();

		// Map fields from each image object to its respective org
		if(!_.isEmpty(images)){
			orgs.map((org) => {
				image = _.find(images, (img) => ( img._id === org.image));

				imageObject = {
					_id: image._id,
					path: `/uploads/${image._id}.${image.extension}`
				};

				org.image = imageObject
			});
		}
	}
	return {
		loading: !themesHandle.ready() && !orgsHandle.ready() && !imagesHandle.ready(),
		theme: theme,
		organizations: orgs
	};
})(withRouter(PresentationLayout));

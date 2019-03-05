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

class Kiosk extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if(this.props.loading){
			return(<Loader />);
		}
		return (
			<div>Kiosk</div>
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

				if(image){
					org.image = image;
				}
			});
		}
	}

	return {
		loading: !themesHandle.ready() && !orgsHandle.ready() && !imagesHandle.ready(),
		theme: theme,
		organizations: orgs
	};
})(withRouter(Kiosk));

import { Meteor } from 'meteor/meteor';
import React from 'react';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { filterTopOrgs } from '/imports/utils';

import { Themes, PresentationSettings, Organizations, Images } from '/imports/api';
import { ThemeMethods, PresentationSettingsMethods, OrganizationMethods, ImageMethods } from '/imports/api/methods';

/**
 * Initialize the Context
 */
const ImageContext = React.createContext('theme');

/**
 * Create a Provider with its own API to act as App-wide state store
 */
class ImageProviderTemplate extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<ImageContext.Provider value={{
				images: this.props.images,
				imagesLoading: this.props.loading
			}}>
				{this.props.children}
			</ImageContext.Provider>
		);
	}
}

const ImageProvider = withTracker((props) => {
	if(!props.id) return { loading: true };

	let OrgsHandle = Meteor.subscribe('organizations', props.id);
	let orgs = Organizations.find({theme: props.id}).fetch();

	let imgIds = orgs.map((org) => ( org.image ));
	let imagesHandle = Meteor.subscribe('images', imgIds);

	let images = [];
	if(!_.isEmpty(imgIds)){
		images = Images.find({_id: {$in: imgIds}}).fetch();
	}

	let loading = (!imagesHandle.ready());

	return { loading, images };
})(ImageProviderTemplate);

export { ImageContext, ImageProvider };

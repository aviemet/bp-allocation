import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { withTracker } from 'meteor/react-meteor-data';

import { Organizations, Images } from '/imports/api';

/**
 * Initialize the Context
 */
const ImageContext = React.createContext();

/**
 * Create a Provider with its own API to act as App-wide state store
 */
const ImageProviderTemplate = props => {

	return (
		<ImageContext.Provider value={ {
			images: props.images,
			imagesLoading: props.loading,
			handles: props.handles
		} }>
			{props.children}
		</ImageContext.Provider>
	);
};

ImageProviderTemplate.propTypes = {
	images: PropTypes.array,
	loading: PropTypes.bool,
	handles: PropTypes.object,
	children: PropTypes.object
};

const ImageProvider = withTracker(props => {
	if(!props.id) return { loading: true };

	// let OrgsHandle = Meteor.subscribe('organizations', props.id);
	let orgs = Organizations.find({ theme: props.id }).fetch();

	let imgIds = orgs.map((org) => ( org.image ));
	let imagesHandle = Meteor.subscribe('images', imgIds);

	let images = [];
	if(!_.isEmpty(imgIds)){
		images = Images.find({ _id: { $in: imgIds }}).fetch();
	}

	let loading = (!imagesHandle.ready());

	return { 
		loading, 
		images, 
		handles: Object.assign({
			images: imagesHandle
		}, props.handles)
	};
})(ImageProviderTemplate);

/** 
 * Create a hook to access Image Context
 */
const useImages = () => useContext(ImageContext);

export { ImageContext, ImageProvider, useImages };

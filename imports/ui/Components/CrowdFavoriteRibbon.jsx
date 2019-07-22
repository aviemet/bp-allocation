import React from 'react';
import PropTypes from 'prop-types';

import { Label } from 'semantic-ui-react';

/**
 * Adorn table row with a ribbon for the crowd favorite
 */
const CrowdFavoriteRibbon = props => {
	if(props.crowdFavorite === false){
		return <React.Fragment>{props.children}</React.Fragment>;
	}
	return <Label ribbon color='green'>{props.children}: Crowd Favorite</Label>;
};

CrowdFavoriteRibbon.propTypes = {
	crowdFavorite: PropTypes.bool,
	children: PropTypes.node
};

export default CrowdFavoriteRibbon;
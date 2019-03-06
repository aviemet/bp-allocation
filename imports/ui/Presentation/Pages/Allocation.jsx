import React from 'react';

import { Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import Graph from '/imports/ui/Presentation/Graph/Graph';

export default class Allocation extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<React.Fragment>
				<Graph theme={this.props.theme} orgs={this.props.orgs} />
			</React.Fragment>
		);
	}
}

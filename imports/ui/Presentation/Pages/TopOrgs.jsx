import React from 'react';

import { Card, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeMethods } from '/imports/api/methods';

import OrgCard from '/imports/ui/Components/OrgCard';

const TopOrgsContainer = styled.div`
	padding-top: 60px;

	.ui.card .content{
		color: #002B45;
		padding-bottom: 0.2em;
	}

	p{
		line-height: 1em;
	}
`;

const PageTitle = styled.h2`
	margin-bottom: 46px;
`;

export default class Intro extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		// this.topOrgs = ThemeMethods.filterTopOrgs(props.theme, props.orgs);
	}

	render() {
		return (
			<TopOrgsContainer>
				<PageTitle>Top {this.props.orgs.length} Organizations</PageTitle>
				<Container>
					<Card.Group centered itemsPerRow={3}>
					{this.props.orgs.map((org) => (
						<OrgCard org={org} key={org._id} animateClass={this.props.animate}  />
					))}
					</Card.Group>
				</Container>
			</TopOrgsContainer>
		);
	}
}

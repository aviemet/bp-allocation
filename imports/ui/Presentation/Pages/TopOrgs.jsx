import React from 'react';

import { Card, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeMethods } from '/imports/api/methods';

import OrgCard from '/imports/ui/Presentation/OrgCard';

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
		this.topOrgs = ThemeMethods.filterTopOrgs(this.props.theme, this.props.orgs);
		console.log({props: this.props, toporgs: this.topOrgs});
	}

	render() {
		return (
			<TopOrgsContainer>
				<PageTitle>Participating Organizations</PageTitle>
				<Container>
					<Card.Group centered itemsPerRow={3}>
					{this.topOrgs.map((org) => (
						<OrgCard org={org} key={org._id} />
					))}
					</Card.Group>
				</Container>
			</TopOrgsContainer>
		);
	}
}

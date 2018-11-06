import React from 'react';
import { Loader, Card, Container } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeContext } from '/imports/ui/Contexts';

import numeral from 'numeral';

import OrgCard from '/imports/ui/Presentation/OrgCard';

const OrgsContainer = styled.div`
	padding-top: 20px;

	.ui.card .content{
		color: #002B45;
		padding-bottom: 0.2em;
	}

	p{
		line-height: 1em;
	}
`;

const PageTitle = styled.h2`
	margin-bottom: 20px;
`;

const ThemeConsumer = ThemeContext.Consumer;

export default class Intro extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true
		}
	}

	render() {
		return (
			<OrgsContainer>
				<PageTitle>Participating Organizations</PageTitle>
				<Container>
					<Card.Group centered itemsPerRow={4}>
					{this.props.orgs.map((org) => (
						<OrgCard org={org} key={org._id} />
					))}
					</Card.Group>
				</Container>
			</OrgsContainer>
		);
	}
}

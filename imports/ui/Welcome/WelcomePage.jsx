import React from 'react';

import { Grid, Card } from 'semantic-ui-react';
import styled from 'styled-components';

export default class WelcomePage extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
				<Grid.Row>

					<Card.Group centered>
						<Card	href={`/admin/${this.props.id}`} header="Mission Control" />
						<Card	href={`/presentation/${this.props.id}`} header="Live Presentation" />
					</Card.Group>

					<Card.Group centered>
						<Card	href={`/kiosk/${this.props.id}`} header="Voting Kiosk" />
						<Card	href={`/feedback/${this.props.id}`} header="Real Time Updates" />
					</Card.Group>

				</Grid.Row>
		);
	}
}

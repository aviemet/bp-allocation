import React from 'react';
import PropTypes from 'prop-types';

import { Grid, Card } from 'semantic-ui-react';

const WelcomePage = ({ match }) => (
	<Grid.Row>
		<Card.Group centered>
			<Card	href={ `/admin/${match.params.id}` } header="Mission Control" />
			<Card	href={ `/presentation/${match.params.id}` } header="Live Presentation" />
		</Card.Group>

		<Card.Group centered>
			<Card	href={ `/kiosk/${match.params.id}` } header="Voting Kiosk" />
			<Card	href={ `/feedback/${match.params.id}` } header="Real Time Updates" />
		</Card.Group>

	</Grid.Row>
);

WelcomePage.propTypes = {
	match: PropTypes.object
};

export default WelcomePage;

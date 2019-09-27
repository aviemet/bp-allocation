import React from 'react';
import { Container } from 'semantic-ui-react';
import styled from 'styled-components';

const ErrorContainer = styled(Container)`
	color: white;
	text-align: center;
`;

const FourOhFour = () => {

	return (
		<ErrorContainer>
			<h1>Uh Oh!</h1>
			<p>The URL entered doesn&apos;t match a route on this application.</p>
			<p>This error page does not redirect.</p>
		</ErrorContainer>
	);
};

export default FourOhFour;

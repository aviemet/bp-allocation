import React from 'react';
import PropTypes from 'prop-types';

import { Container, Grid } from 'semantic-ui-react';
import styled from 'styled-components';

import HomeButton from '/imports/ui/Components/HomeButton';

const FeedbackContainer = styled.div`
	background: #111;
	width: 100%;
	min-height: 100%;
`;

const FeedbackLayout = (props) => (
	<FeedbackContainer>
		<HomeButton />

		<Container>
			<Grid columns={ 16 }>
				{props.children}
			</Grid>
		</Container>
	</FeedbackContainer>
);

FeedbackLayout.propTypes = {
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node
	])
};

export default FeedbackLayout;

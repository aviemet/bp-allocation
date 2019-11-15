import React from 'react';
import PropTypes from 'prop-types';

import { Image } from 'semantic-ui-react';
import styled from 'styled-components';

const Intro = props => {

	return (
		<TitlePage>
			<MainHeading>Allocation Night</MainHeading>
			<ThemeTitle>{props.title}</ThemeTitle>
			<ThemeQuestion>{props.question}</ThemeQuestion>
			<LogoContainer>
				<Image src='/img/BPLogoBlue.svg' />
			</LogoContainer>
		</TitlePage>
	);
};

const TitlePage = styled.div`
	margin: 0 auto;
	top: 50%;
	left: 50%;
	position: absolute;
	transform: translate(-50%, -50%);
	width: 100%;

	h1, h2 {
		color: #fff;
		text-transform: uppercase;
		clear: both;
	}
	h2 {
		margin: 0 auto;
		max-width:1300px;
	}
`;

const MainHeading = styled.h1`
	font-family: 'BentonMod';
	letter-spacing: 4px;
	padding-top: 0.7em;
	margin-bottom: 1em;
	font-size: 8.5em;
	text-transform: uppercase;
	clear: both;
`;

const ThemeTitle = styled.h2`
	&& { /* Bump this up to a higher specificity */
		font-size: 4em;
		text-decoration: underline;
	}
`;

const LogoContainer = styled.div`
	margin: 5em auto;
	display: block;
	width: 250px;
`;

const ThemeQuestion = styled.h2`
	margin-bottom: 1.5em;
`;

Intro.propTypes = {
	title: PropTypes.string,
	question: PropTypes.string
};

export default Intro;

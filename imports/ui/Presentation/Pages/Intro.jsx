import React from 'react';

import { Header, Loader, Image } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeContext } from '/imports/ui/Contexts';

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

const ThemeConsumer = ThemeContext.Consumer;

export default class Intro extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<ThemeConsumer>{(context) => (
				<TitlePage>
					<MainHeading>Allocation Night</MainHeading>
					<ThemeTitle>{context.theme.title}</ThemeTitle>
					<ThemeQuestion>{context.theme.question}</ThemeQuestion>
					<LogoContainer>
						<Image src='/img/BPLogoBlue.svg' />
					</LogoContainer>
				</TitlePage>
			)}</ThemeConsumer>
		);
	}
}

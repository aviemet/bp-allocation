import React from 'react'
import PropTypes from 'prop-types'

import Image from '/imports/ui/Components/Image'
import styled from '@emotion/styled'

const Intro = props => {

	return (
		<TitlePage>
			<MainHeading>Allocation Night</MainHeading>
			<ThemeTitle>{ props.title }</ThemeTitle>
			<ThemeQuestion>{ props.question }</ThemeQuestion>
			<LogoContainer>
				<Image src='/img/BPLogoBlue.svg' />
			</LogoContainer>
		</TitlePage>
	)
}

const TitlePage = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	height: 100%;

	h1, h2 {
		color: #fff;
		text-transform: uppercase;
		clear: both;
	}
	h2 {
		margin: 0 auto;
		max-width:1300px;
	}
`

const MainHeading = styled.h1`
	font-family: 'BentonMod';
	letter-spacing: 4px;
	font-size: 6em;
	text-transform: uppercase;
	clear: both;
`

const ThemeTitle = styled.h2`
	&& { /* Bump this up to a higher specificity */
		font-size: 4em;
		text-decoration: underline;
	}
`

const ThemeQuestion = styled.h2`
`

const LogoContainer = styled.div`
	display: block;
`

Intro.propTypes = {
	title: PropTypes.string,
	question: PropTypes.string
}

export default Intro

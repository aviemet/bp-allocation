import React from 'react'
import styled from '@emotion/styled'
import { ImgProps } from 'react-html-props'

const Image = ({ src, ...props }: ImgProps) => {
	return (
		<Img src={ src } { ...props } />
	)
}

const Img = styled.img`
	max-width: 100%;
	position: relative;
	background-color: transparent;
`

export default Image

import React from "react"
import PropTypes from "prop-types"
import styled from "@emotion/styled"

const Image = ({ src, ...props }) => {
	return (
		<Img src={ src } { ...props } />
	)
}

const Img = styled.img`
	max-width: 100%;
	position: relative;
	background-color: transparent;
`

Image.propTypes = {
	src: PropTypes.string,
}

export default Image

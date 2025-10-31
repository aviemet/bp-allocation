import styled from "@emotion/styled"
import PropTypes from "prop-types"

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

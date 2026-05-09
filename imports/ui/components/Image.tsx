import styled from "@emotion/styled"
import { type ImgHTMLAttributes } from "react"

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
	src?: string
}

export const Image = ({ src, ...props }: ImageProps) => {
	return (
		<Img src={ src } { ...props } />
	)
}

const Img = styled.img`
	max-width: 100%;
	position: relative;
	background-color: transparent;
`


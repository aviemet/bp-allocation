import React from 'react'
import { Link, type LinkProps } from 'wouter'

const LinkComponent = (props: LinkProps) => {
	return <Link { ...props } />
}

export default LinkComponent

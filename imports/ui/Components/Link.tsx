import React, { forwardRef } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

const LinkComponent = forwardRef<HTMLAnchorElement,LinkProps>(({ to, ...props }, ref) => {
	return (
		<Link ref={ ref } to={ to } { ...props } />
	)
})

export default LinkComponent

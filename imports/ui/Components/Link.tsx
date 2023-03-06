import React, { forwardRef } from 'react'
import { Link, type LinkProps } from 'wouter'

const RouterLink = Link as React.FunctionComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>

const LinkComponent = forwardRef<HTMLAnchorElement,LinkProps>((props, ref) => {
	return (
		<RouterLink ref={ ref } { ...props } />
	)
})

export default LinkComponent

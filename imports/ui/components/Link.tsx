import MuiLink, { LinkProps as MuiLinkProps } from "@mui/material/Link"
import { Link as RouterLink, LinkProps as RouterLinkProps } from "@tanstack/react-router"
import { forwardRef } from "react"

type CombinedLinkProps = MuiLinkProps & {
	to?: RouterLinkProps["to"]
	params?: RouterLinkProps["params"]
	search?: RouterLinkProps["search"]
	hash?: RouterLinkProps["hash"]
}

const Link = forwardRef<HTMLAnchorElement, CombinedLinkProps>((props, ref) => {
	const { to, params, search, hash, href, ...rest } = props

	if(to) {
		return (
			<MuiLink
				component={ RouterLink }
				to={ to }
				params={ params }
				search={ search }
				hash={ hash }
				ref={ ref }
				{ ...rest }
			/>
		)
	}

	return (
		<MuiLink
			href={ href }
			ref={ ref }
			{ ...rest }
		/>
	)
})

export default Link

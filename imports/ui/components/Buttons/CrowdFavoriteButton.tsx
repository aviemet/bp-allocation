import { Button, ButtonProps } from "@mui/material"
import { type OrganizationWithComputed } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"

interface CrowdFavoriteButtonProps extends Omit<ButtonProps, "onClick"> {
	org: OrganizationWithComputed
}

export const CrowdFavoriteButton = ({ org, ...rest }: CrowdFavoriteButtonProps) => {
	const isCurrentlyCrowdFavorite = org.topOff > 0
	const text = isCurrentlyCrowdFavorite ? "Undo Crowd Fav" : "Crowd Fav"
	const color: "warning" | "success" = isCurrentlyCrowdFavorite ? "warning" : "success"

	const handleClick = () => {
		OrganizationMethods.crowdFavorite.callAsync({ id: org._id, negate: isCurrentlyCrowdFavorite })
	}

	return (
		<Button
			onClick={ handleClick }
			color={ color }
			sx={ {
				width: "100%",
				whiteSpace: "nowrap",
			} }
			{ ...rest }
		>
			{ text }
		</Button>
	)
}

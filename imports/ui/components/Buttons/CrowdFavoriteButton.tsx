import { Button, ButtonProps } from "@mui/material"
import { type OrganizationWithComputed } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"

interface CrowdFavoriteButtonProps extends Omit<ButtonProps, "onClick"> {
	org: OrganizationWithComputed
	target?: number
}

export const CrowdFavoriteButton = ({ org, target, ...rest }: CrowdFavoriteButtonProps) => {
	const isCurrentlyCrowdFavorite = org.topOff > 0
	const text = isCurrentlyCrowdFavorite ? "Undo Crowd Fav" : "Crowd Fav"
	const color: "warning" | "success" = isCurrentlyCrowdFavorite ? "warning" : "success"

	const handleClick = () => {
		let amount: number
		if(isCurrentlyCrowdFavorite) {
			amount = 0
		} else if(target !== undefined) {
			const currentFunded = org.allocatedFunds + org.leverageFunds
			amount = Math.max(0, target - currentFunded)
		} else {
			amount = org.need - org.leverageFunds
		}
		OrganizationMethods.update.callAsync({ id: org._id, data: { topOff: amount } })
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

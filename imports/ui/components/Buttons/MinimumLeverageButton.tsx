import { Button, ButtonProps } from "@mui/material"
import { useMemo } from "react"
import { type OrganizationWithComputed } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"

interface MinimumLeverageButtonProps extends Omit<ButtonProps, "onClick"> {
	orgs: OrganizationWithComputed[]
	target?: number
}

export const MinimumLeverageButton = ({ orgs, target, ...rest }: MinimumLeverageButtonProps) => {
	const hasAnyMinimumLeverageApplied = useMemo(
		() => orgs.some(org => org.topOff > 0),
		[orgs],
	)
	const text = hasAnyMinimumLeverageApplied ? "Undo Minimum Top Up" : "Minimum Top Up"
	const color: "warning" | "primary" = hasAnyMinimumLeverageApplied ? "warning" : "primary"

	const handleClick = () => {
		if(hasAnyMinimumLeverageApplied) {
			orgs.forEach(async (org) => {
				await OrganizationMethods.update.callAsync({ id: org._id, data: { topOff: 0 } })
			})
		} else {
			orgs.forEach(async (org) => {
				let amount: number
				if(target !== undefined) {
					const currentFunded = org.allocatedFunds + org.leverageFunds
					amount = Math.max(0, target - currentFunded)
				} else {
					amount = org.need - org.leverageFunds
				}
				await OrganizationMethods.update.callAsync({ id: org._id, data: { topOff: amount } })
			})
		}
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

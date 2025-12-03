import { Button, ButtonProps } from "@mui/material"
import { useMemo } from "react"
import { type OrganizationWithComputed } from "/imports/api/hooks"
import { OrganizationMethods } from "/imports/api/methods"
import { coerceArray } from "/imports/lib/collections"

type ButtonParams = {
	text: string
	color: "primary" | "warning" | "success"
}

interface TopOffButtonProps extends Omit<ButtonProps, "onClick"> {
	orgs: OrganizationWithComputed | OrganizationWithComputed[]
	crowdFavorite?: boolean
	target?: number
}

const TopOffButton = ({ orgs, target, ...rest }: TopOffButtonProps) => {
	const orgsArray = useMemo(() => coerceArray(orgs), [orgs])

	const buttonParams = useMemo((): ButtonParams => {
		const hasTopOff = Array.isArray(orgs)
			? orgsArray.some(org => org.topOff > 0)
			: orgs.topOff > 0

		if(Array.isArray(orgs)) {
			return {
				text: hasTopOff ? "Undo Minimum Top Up" : "Minimum Top Up",
				color: (hasTopOff ? "warning" : "primary"),
			}
		} else {
			return {
				text: hasTopOff ? "Undo Crowd Fav" : "Crowd Fav",
				color: (hasTopOff ? "warning" : "success"),
			}
		}
	}, [orgs, orgsArray])

	const handleTopoff = () => {
		if(Array.isArray(orgs)) {
			const hasAnyTopOff = orgsArray.some(org => org.topOff > 0)

			if(hasAnyTopOff) {
				orgsArray.forEach(async (org) => {
					await OrganizationMethods.update.callAsync({ id: org._id, data: { topOff: 0 } })
				})
			} else {
				orgsArray.forEach(async (org) => {
					let amount
					if(target !== undefined) {
						const currentFunded = org.allocatedFunds + org.leverageFunds
						amount = Math.max(0, target - currentFunded)
					} else {
						amount = org.need - org.leverageFunds
					}
					await OrganizationMethods.update.callAsync({ id: org._id, data: { topOff: amount } })
				})
			}
		} else {
			let amount
			if(orgs.topOff > 0) {
				amount = 0
			} else if(target !== undefined) {
				const currentFunded = orgs.allocatedFunds + orgs.leverageFunds
				amount = Math.max(0, target - currentFunded)
			} else {
				amount = orgs.need - orgs.leverageFunds
			}
			OrganizationMethods.update.callAsync({ id: orgs._id, data: { topOff: amount } })
		}
	}

	return (
		<Button
			onClick={ handleTopoff }
			color={ buttonParams.color }
			sx={ {
				width: "100%",
				whiteSpace: "nowrap",
			} }
			{ ...rest }
		>
			{ buttonParams.text }
		</Button>
	)
}

export default TopOffButton

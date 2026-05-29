import { useFormContext, useWatch } from "react-hook-form"
import { OrgCard, OrgCardContainer } from "/imports/ui/components"
import { type OrgDataWithComputed } from "/imports/api/hooks"

interface SelectableOrgCardsProps {
	orgs: OrgDataWithComputed[]
}

export const SelectableOrgCards = ({ orgs }: SelectableOrgCardsProps) => {
	const { setValue } = useFormContext()
	const watch = useWatch({ name: "id" })

	const handleSetValue = (id: string) => () => {
		if(watch === id) return

		setValue("id", id)
	}

	return (
		<OrgCardContainer cols={ 2 }>
			{ orgs.map(org => {
				const fullyFunded = org.need <= 0
				const selected = watch === org._id

				return (
					<OrgCard
						key={ org._id }
						org={ org }
						showAsk={ false }
						onClick={ handleSetValue(org._id) }
						fullyFunded={ fullyFunded }
						color={ selected ? "green" : fullyFunded ? "dark" : "blue" }
					/>
				)
			}) }
		</OrgCardContainer>
	)
}

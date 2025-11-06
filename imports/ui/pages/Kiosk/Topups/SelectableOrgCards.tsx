import { useFormContext, useWatch } from "react-hook-form"
import { OrgCard, OrgCardContainer } from "/imports/ui/components/Cards"
import { type OrgStore } from "/imports/api/stores"

interface SelectableOrgCardsProps {
	orgs: OrgStore[]
}

const SelectableOrgCards = ({ orgs }: SelectableOrgCardsProps) => {
	const { setValue } = useFormContext()
	const watch = useWatch({ name: "id" })

	const handleSetValue = (id: string) => () => {
		if(watch === id) return

		setValue("id", id)
	}

	return (
		<OrgCardContainer cols={ 2 }>
			{ orgs.filter(org => org.need > 0).map(org => (
				<OrgCard
					key={ org._id }
					org={ org }
					showAsk={ false }
					onClick={ handleSetValue(org._id) }
					color={ watch === org._id ? "green" : "blue" }
				/>
			) ) }
		</OrgCardContainer>
	)
}

export default SelectableOrgCards

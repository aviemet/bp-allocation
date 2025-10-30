import numeral from "numeral"
import PropTypes from "prop-types"
import React, { useState, useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { OrgCard, OrgCardContainer } from "/imports/ui/components/Cards"

const SelectableOrgCards = ({ orgs }) => {
	const { setValue } = useFormContext()
	const watch = useWatch({ name: "id" })

	const handleSetValue = id => () => {
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

SelectableOrgCards.propTypes = {
	orgs: PropTypes.array.isRequired,
}

export default SelectableOrgCards

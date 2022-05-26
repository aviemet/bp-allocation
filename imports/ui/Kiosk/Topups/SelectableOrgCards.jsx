import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'
import { useFormContext, useWatch } from 'react-hook-form'
import { OrgCard, OrgCardContainer } from '/imports/ui/Components/Cards'

const SelectableOrgCards = ({ orgs }) => {
	const { setValue } = useFormContext()
	const watch = useWatch({ name: 'id' })

	const handleSetValue = id => () => {
		if(watch === id) return

		setValue('id', id)
	}

	return (
		<OrgCardContainer cols={ 2 }>
			{ orgs.filter(org => org.need > 0).map(org => (
				<OrgCard
					key={ org._id }
					org={ org }
					showAsk={ false }
					onClick={ handleSetValue(org._id) }
					color={ watch === org._id ? 'green' : 'blue' }
				>
					{ numeral(org.need).format('$0a') }
				</OrgCard>
			) ) }
		</OrgCardContainer>
	)
}

SelectableOrgCards.propTypes = {
	orgs: PropTypes.array.isRequired,
}

export default SelectableOrgCards

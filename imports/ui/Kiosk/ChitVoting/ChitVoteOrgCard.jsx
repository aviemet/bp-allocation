import React from 'react'
import PropTypes from 'prop-types'
import { OrgCard } from '/imports/ui/Components/Cards'
import ChitTicker from '/imports/ui/Kiosk/ChitVoting/ChitTicker'

const ChitVoteOrgCard = ({ org }) => {
	return (
		<OrgCard
			key={ org._id }
			org={ org }
			showAsk={ false }
			size='small'
			info={ true }
			content={ () => (
				<ChitTicker
					org={ org }
				/>
			) }
		/>
	)
}

ChitVoteOrgCard.propTypes = {
	org: PropTypes.any
}
export default ChitVoteOrgCard
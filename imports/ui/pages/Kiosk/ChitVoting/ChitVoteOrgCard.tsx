import PropTypes from "prop-types"

import { OrgCard } from "/imports/ui/components/Cards"
import ChitTicker from "./ChitTicker"

const ChitVoteOrgCard = ({ org }) => {
	return (
		<OrgCard
			org={ org }
			showAsk={ false }
			size="small"
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
	org: PropTypes.any,
}
export default ChitVoteOrgCard

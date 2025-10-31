import PropTypes from "prop-types"

import Graph from "./Graph"
import PledgesOverlay from "./PledgesOverlay"

const Allocation = ({ simulation }) => (
	<>
		<Graph simulation={ simulation || false } />
		{ !simulation && <PledgesOverlay /> }
	</>
)

Allocation.propTypes = {
	simulation: PropTypes.bool,
}

export default Allocation

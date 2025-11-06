import Graph from "./Graph"
import PledgesOverlay from "./PledgesOverlay"

interface AllocationProps {
	simulation?: boolean
}

const Allocation = ({ simulation }: AllocationProps) => (
	<>
		<Graph simulation={ simulation || false } />
		{ !simulation && <PledgesOverlay /> }
	</>
)

export default Allocation

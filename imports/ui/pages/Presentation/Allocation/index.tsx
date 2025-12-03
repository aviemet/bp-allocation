import Graph from "./Graph"
import PledgesOverlay from "./PledgesOverlay"
import { useOrgs, useSettings, useTheme } from "/imports/api/hooks"

interface AllocationProps {
	simulation?: boolean
}

const Allocation = ({ simulation }: AllocationProps) => {
	const { theme } = useTheme()
	const { settings } = useSettings()
	const { orgs, topOrgs } = useOrgs()

	if(!theme || !settings || !orgs) return <></>

	return (
		<>
			<Graph
				isSimulation={ simulation || false }
				theme={ theme }
				settings={ settings }
				orgs={ orgs }
				topOrgs={ topOrgs }
			/>
			{ !simulation && <PledgesOverlay /> }
		</>
	)
}

export default Allocation

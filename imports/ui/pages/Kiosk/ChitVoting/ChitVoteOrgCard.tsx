import { OrgCard } from "/imports/ui/components/Cards"
import ChitTicker from "./ChitTicker"
import { type OrgData } from "/imports/api/db"

interface ChitVoteOrgCardProps {
	org: OrgData
}

const ChitVoteOrgCard = ({ org }: ChitVoteOrgCardProps) => {
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
export default ChitVoteOrgCard

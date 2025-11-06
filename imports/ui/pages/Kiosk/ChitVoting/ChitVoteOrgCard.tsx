import { OrgCard } from "/imports/ui/components/Cards"
import ChitTicker from "./ChitTicker"
import { type OrgStore } from "/imports/api/stores"

interface ChitVoteOrgCardProps {
	org: OrgStore
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

import { MemberFundsVoteStatus } from "/imports/lib/allocation/memberVotes"
import CheckIcon from "@mui/icons-material/Check"
import DoNotDisturbOnOutlinedIcon from "@mui/icons-material/DoNotDisturbOnOutlined"
import { Tooltip } from "@mui/material"

interface VotedFundsIconProps {
	fundsVoteStatus: MemberFundsVoteStatus
}

export function VotedFundsIcon({ fundsVoteStatus }: VotedFundsIconProps) {
	switch(fundsVoteStatus) {
		case "full":
			return <CheckIcon color="success" sx={ { ml: 0.5, verticalAlign: "middle" } } />

		case "partial":
			return (
				<Tooltip title="Partially voted funds">
					<DoNotDisturbOnOutlinedIcon color="warning" sx={ { ml: 0.5, verticalAlign: "middle" } } />
				</Tooltip>
			)

		default:
			return null
	}
}

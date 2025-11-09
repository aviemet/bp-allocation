import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import PledgeAnimationMethods from "/imports/api/methods/PledgeAnimationMethods"
import { type PledgeWithOrg } from "/imports/api/stores/OrgsCollection"

interface ReplayPledgeAnimationButtonProps {
	pledge: PledgeWithOrg
}

const ReplayPledgeAnimationButton = ({ pledge }: ReplayPledgeAnimationButtonProps) => {
	const handleClick = () => {
		PledgeAnimationMethods.enqueuePledgeAnimation.callAsync({
			pledgeId: pledge._id,
			orgId: pledge.org._id,
			orgTitle: pledge.org.title,
		})
	}

	return (
		<Tooltip title="Replay pledge animation on presentation screen">
			<IconButton size="small" onClick={ handleClick }>
				<PlayArrowIcon />
			</IconButton>
		</Tooltip>
	)
}

export default ReplayPledgeAnimationButton


import styled from "@emotion/styled"
import { observer } from "mobx-react-lite"
import PropTypes from "prop-types"


/**
 * Award Emblem
 */
const AwardEmblem = observer(({ type, amount }) => {

	const awardImgSrc = {
		awardee: "/img/circle_awardee.png",
		other: "/img/circle.png",
	}

	return (
		<Award>
			<AwardImage style={ { backgroundImage: `url(${awardImgSrc[type || "awardee"]})` } }>
				<AwardAmount style={ { fontSize: type === "awardee" ? "3rem" : "2.7rem" } }>{ amount }</AwardAmount>
			</AwardImage>
		</Award>
	)
})

const Award = styled.div`
	width: 100%;
	height: 100%;
	text-align: center;
`

const AwardImage = styled.div`
	width: 100%;
	height: 100%;
	background-size: cover;
	background-position: center center;
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
`

const AwardAmount = styled.span`
	margin-top: 1rem;
	color: #fff;
	font-family: TradeGothic;
	z-index: 999;
	font-weight: 700;
`

AwardEmblem.propTypes = {
	type: PropTypes.string,
	amount: PropTypes.oneOfType([
		PropTypes.number, PropTypes.string,
	]),
}

export default AwardEmblem

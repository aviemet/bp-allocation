import React from 'react';
import PropTypes from 'prop-types';

import { observer } from 'mobx-react-lite';

import { Image } from 'semantic-ui-react';
import styled from 'styled-components';

/**
 * Award Emblem
 */
const AwardEmblem = observer(({ type, amount }) => {

	const awardImgSrc = {
		awardee: '/img/circle_awardee.png',
		other: '/img/circle.png'
	};

	return (
		<Award>
			<AwardImage className='ui.card.image' style={ { backgroundImage: `url(${awardImgSrc[type || 'awardee']})`,
				backgroundSize: type === 'awardee' ? '120%' : '100%' } }>
				<AwardAmount style={ { fontSize: type === 'awardee' ? '3.3em' : '2.9em' } }>{ amount }</AwardAmount>
			</AwardImage>
		</Award>
	);
});

const Award = styled.div`
	width: 100%;
	height: 100%;
	text-align: center;
`;

const AwardImage = styled(Image)`
	width: 100%;
	height: 100%;
	background-position: center center;
	position: relative;
`;

const AwardAmount = styled.span`
	color: #fff;
	font-family: TradeGothic;
	z-index: 999;
	font-weight: 700;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translateX(-50%);
`;

AwardEmblem.propTypes = {
	type: PropTypes.string,
	amount: PropTypes.oneOfType([
		PropTypes.number, PropTypes.string
	])
};

export default AwardEmblem;

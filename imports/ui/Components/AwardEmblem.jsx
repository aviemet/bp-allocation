import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { observer } from 'mobx-react-lite';
import { useData } from '/imports/stores/DataProvider';

import { Image } from 'semantic-ui-react';
import styled from 'styled-components';

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

/**
 * Award Emblem
 */
const AwardEmblem = observer(({ type, amount }) => {
	const data = useData();
	const { settings } = data;
	const members = data.members.values;

	const awardImgSrc = {
		awardee: '/img/circle_awardee.png',
		other: '/img/circle.png'
	};

	if(!settings.formatAsDollars) {
		const percentBase = members.length * 100;
		amount = (amount / percentBase);
	}

	return (
		<Award>
			<AwardImage className='ui.card.image' style={ { backgroundImage: `url(${awardImgSrc[type || 'awardee']})`,
				backgroundSize: type === 'awardee' ? '120%' : '100%' } }>
				<AwardAmount style={ { fontSize: type === 'awardee' ? '3.3em' : '2.9em' } }>{numeral(amount).format(settings.numberFormat)}</AwardAmount>
			</AwardImage>
		</Award>
	);
});

AwardEmblem.propTypes = {
	type: PropTypes.string,
	amount: PropTypes.number
};

export default AwardEmblem;

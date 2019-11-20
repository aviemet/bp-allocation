import React from 'react'
import PropTypes from 'prop-types';
import { useData } from '/imports/stores/DataProvider';
import _ from 'lodash';
import numeral from 'numeral';

import styled from 'styled-components';

const PledgeInfo = ({ pledge }) => {
	const { members } = useData();

	const member = _.find(members.values, ['_id', pledge.member]);
	console.log({ member });

	return (
		<AnimationContainer>
			<AnimationContent>
				<h1 className='memberName'>{ member && member.formattedName }</h1>
				<h1 className='orgTitle'>{ pledge.org.title }</h1>
				<h1 className='amount'>{ numeral(pledge.amount).format('$0,0') }</h1>
			</AnimationContent>
		</AnimationContainer>
	);
};

const AnimationContainer = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;

	h1 {
		-webkit-text-stroke: 3px #000;
		text-shadow: 2px 3px 1px #99F;
		font-weight: 700;

		&.memberName {
			font-size: 6.5rem;
		}

		&.orgTitle {
			font-size: 6.5rem;
		}

		&.amount {
			font-size: 8rem;
		}
	}
`;

const AnimationContent = styled.div`
	opacity: 0;
	animation: fade-in-scroll-up 10s;
`;

PledgeInfo.propTypes = {
	pledge: PropTypes.object
};

export default PledgeInfo;
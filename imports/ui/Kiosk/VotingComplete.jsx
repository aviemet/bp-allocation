import React, { useEffect } from 'react';
import { useVoting } from './VotingContext';

import styled from 'styled-components';

const Centered = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-transform: uppercase;
  font-size: 6rem;
  line-height: 6rem;
	text-align: center;
	color: white;
	
	@media screen and (max-width: ${({ theme }) => theme.media.onlyTablet.minWidth}px) {
		font-size: 4rem !important;
	}
`;

const VotingComplete = () => {

	const { unsetUser } = useVoting();

	useEffect(() => {
		setTimeout(() => {
			unsetUser();
		}, 2000);
	}, []);

	return (
		<Centered>Voting Complete!</Centered>
	);
};

export default VotingComplete;

import React from 'react';

import numeral from 'numeral';

import { Grid } from 'semantic-ui-react';
import styled from 'styled-components';

const InfoContainer = styled(Grid.Column)`
	&&{
		margin: 0 1.5em;
		padding: 0 !important;
		margin-bottom: -6px;
		bottom: 0;
		text-align: center;
		font-size: 1.5em;
		line-height: 1em;
	}
`;

const Title = styled.div`
	min-height: 60px;
`;

const Ask = styled.div`
	color: #ea810c;
`;

const MatchNeed = styled.div`
	color: #c31a1a;
`;

const TotalNeed = styled.div`
	color: #00853f;
`;

const OrgInfo = props => {
	return (
		<InfoContainer className='orginfo'>
			<Title>{props.org.title}</Title>


			<TotalNeed>
				Need: {props.org.need > 0 ? `$${numeral(props.org.need).format('0.0a')}` : '--'}
			</TotalNeed>

			{props.showLeverage &&
				<MatchNeed>
					Match Need: {props.org.need > 0 ? `$${numeral(props.org.need / 2).format('0.0a')}` : '--'}
				</MatchNeed>
			}

		</InfoContainer>
	);
}

export default OrgInfo;

// <Ask>Ask: ${numeral(props.org.ask).format('0.0a')}</Ask>

import React from 'react'
import PropTypes from 'prop-types'

import { observer } from 'mobx-react-lite'

import numeral from 'numeral'

import { Grid } from 'semantic-ui-react'
import styled from '@emotion/styled'

const OrgInfo = observer(props => {

	return (
		<InfoContainer className='orginfo'>
			<Title>{props.org.title}</Title>

			<TotalNeed>
				Need: {props.org.need > 0 ? `$${numeral(props.org.need).format('0,0[a]')}` : '--'}
			</TotalNeed>
			
			{props.showLeverage &&
				<MatchNeed>
					Match Need: {props.org.need > 0 ? `$${numeral(props.org.need / 2).format('0,0[a]')}` : '--'}
				</MatchNeed>
			}

		</InfoContainer>
	)
})

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
`

const Title = styled.div`
	min-height: 60px;
`

const MatchNeed = styled.div`
	color: #c31a1a;
`

const TotalNeed = styled.div`
	color: #00853f;
`

OrgInfo.propTypes = {
	org: PropTypes.object,
	showLeverage: PropTypes.bool
}

export default OrgInfo

// <Ask>Ask: ${numeral(props.org.ask).format('0.0a')}</Ask>

import React from 'react'
import PropTypes from 'prop-types'

import { observer } from 'mobx-react-lite'

import numeral from 'numeral'

import { Grid } from 'semantic-ui-react'
import styled from '@emotion/styled'

const OrgInfo = observer(({ org, showLeverage }) => {
	const need = org.need - org.leverageFunds
	return (
		<InfoContainer className='orginfo'>
			<Title>{ org.title }</Title>

			<TotalNeed>
				Need: { need > 0 ? `$${numeral(need).format('0,0[a]')}` : '--' }
			</TotalNeed>

			{ showLeverage &&
				<MatchNeed>
					Match Need: { need > 0 ? `$${numeral(need / 2).format('0,0[a]')}` : '--' }
				</MatchNeed>
			}

		</InfoContainer>
	)
})

const InfoContainer = styled(Grid.Column)`
	&& {
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

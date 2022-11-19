import React from 'react'
import { observer } from 'mobx-react-lite'
import styled from '@emotion/styled'

interface IAwardEmblemProps {
	type?: 'awardee'|'other'
	amount: number
}

const AwardEmblem = observer(({ type = 'awardee', amount }: IAwardEmblemProps) => {
	const awardImgSrc = {
		awardee: '/img/circle_awardee.png',
		other: '/img/circle.png',
	}

	return (
		<Award>
			<AwardImage style={ { backgroundImage: `url(${awardImgSrc[type]})` } }>
				<AwardAmount style={ { fontSize: type === 'awardee' ? '3rem' : '2.7rem' } }>{ amount }</AwardAmount>
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

export default AwardEmblem

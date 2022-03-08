import React from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'
import _ from 'lodash'

import { Card, Icon, Button, Modal } from 'semantic-ui-react'
import styled from '@emotion/styled'
import { observer } from 'mobx-react-lite'

// TODO: Use styledcomponents theme
const GREEN = '#0D8744'
const BLUE = '#002B43'

/**
 * OrgCard Component
 */
const OrgCard = observer(({
	org,
	overlay,
	content,
	index,
	size,
	showAsk,
	animateClass,
	info,
	bgcolor,
	onClick,
	disabled,
	...rest
}) => {

	const Overlay = overlay || false
	const Content = content || false

	let localBgColor = bgcolor || GREEN
	if(!bgcolor && index) {
		const row = parseInt(index / 4) % 4
		localBgColor = (index + (row % 2)) % 2 === 0 ? GREEN : BLUE
	}

	const cardClasses = []
	if(size) cardClasses.push(size)
	if(animateClass) cardClasses.push('animate-orgs')
	if(disabled) cardClasses.push('disabled')

	return (
		<StyledCard link={ false } className={ cardClasses.join(' ') } onClick={ onClick } >
			{ Overlay && <Overlay /> }

			<CardContent bgcolor={ localBgColor } >

				{ content && <Card.Content>
					<Content />
				</Card.Content> }

				{ info && <InfoLink>
					<Modal
						trigger={ <Button compact circular size='mini' icon='info' /> }
						closeIcon
						size='large'
					>
						<Modal.Header>{ org.title }</Modal.Header>
						<Modal.Content scrolling>{ org.description && <div dangerouslySetInnerHTML={ { __html: org.description } } /> }</Modal.Content>
					</Modal>
				</InfoLink> }

				<OrgTitle><p>{ org.title }</p></OrgTitle>
				{ (_.isUndefined(showAsk) ? true : !!showAsk) && <OrgAsk>{ numeral(org.ask).format('$0a') }</OrgAsk> }
			</CardContent>
		</StyledCard>
	)
})

OrgCard.colors = { GREEN, BLUE }

const StyledCard = styled(Card)`
	text-align: center;

	&& {
		border: 5px solid #FFF !important;

		.content {
			padding: 1rem 0.5rem;
		}
	}

	&.big {
		// height: 13rem;
	}

	&.disabled {
		filter: opacity(0.5);

		& > * {
			color: #666 !important;
		}
	}
`

const CardContent = styled(Card.Content)`
	background-color: ${({ bgcolor }) => bgcolor} !important;
	color: #FFF;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;

	& a {
		color: #FFF;
	}
`

const OrgTitle = styled.div`
	font-family: TradeGothic;
	font-size: 2.5rem;
	margin: 5px;
	font-weight: 600;
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;

	.small & {
		min-height: 3.5rem;
	}

	.big & {
		// min-height: 13.5rem;
		font-size: 3.4rem;
	}
`

const OrgAsk = styled.p`
	font-family: TradeGothic20;
	font-size: 3rem;
	font-weight: 700;
`

const InfoLink = styled(Icon)`
	position: absolute;
	top: 10px;
	right: 10px;
`

OrgCard.propTypes = {
	org: PropTypes.object,
	overlay: PropTypes.any,
	content: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.func
	]),
	index: PropTypes.number,
	size: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string
	]),
	showAsk: PropTypes.bool,
	animateClass: PropTypes.bool,
	info: PropTypes.bool,
	bgcolor: PropTypes.string,
	onClick: PropTypes.func,
	rest: PropTypes.any
}

export default OrgCard

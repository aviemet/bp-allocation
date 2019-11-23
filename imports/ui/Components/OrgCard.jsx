import React, { useState } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import _ from 'lodash';

import { Card, Icon, Button, Modal, Responsive } from 'semantic-ui-react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

// TODO: Use styledcomponents theme
const GREEN = '#0D8744';
const BLUE = '#002B43';

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

	const [ modalSize, setModalSize ] = useState('large');

	const Overlay = overlay || false;
	const Content = content || false;

	let localBgColor = bgcolor || GREEN;
	if(!bgcolor && index) {
		const row = parseInt(index / 4) % 4;
		localBgColor = (index + (row % 2)) % 2 === 0 ? GREEN : BLUE;
	}

	const cardClasses = [];
	if(size) cardClasses.push(size);
	if(animateClass) cardClasses.push('animate-orgs');
	if(disabled) cardClasses.push('disabled');

	const handleOnUpdate = (e, { width }) => {
		let size = 'large';
		if(width <= Responsive.onlyTablet.minWidth) {
			size = 'fullscreen';
		}
		setModalSize(size);
	};

	return (
		<StyledCard link={ false } className={ cardClasses.join(' ') } onClick={ onClick } >
			{ Overlay && <Overlay /> }

			<CardContent bgcolor={ localBgColor } >

				{ content && <Card.Content>
					<Content />
				</Card.Content> }

				{ info && <InfoLink>
					<Responsive 
						as={ Modal } 
						trigger={ <Button compact circular size='mini' icon='info' /> } 
						closeIcon
						size={ modalSize }
						fireOnMount
						onUpdate={ handleOnUpdate }
					>
						<Modal.Header>{ org.title }</Modal.Header>
						<Modal.Content scrolling>{ org.description && org.description.split(/\n/).map((part, i) => (
							<p key={ i }>{ part }</p>
						) ) }</Modal.Content>
					</Responsive>
				</InfoLink> }

				<OrgTitle><p>{ org.title }</p></OrgTitle>
				{ (_.isUndefined(showAsk) ? true : !!showAsk) && <OrgAsk>Ask: { numeral(org.ask).format('$0a') }</OrgAsk> }
			</CardContent>
		</StyledCard>
	);
});

OrgCard.colors = { GREEN, BLUE };

const StyledCard = styled(Card)`
	text-align: center;

	&& {
		border: 5px solid #FFF !important;

		.content {
			padding: 1em 0.5em;
		}
	}

	&.big {
		height: 21rem;
	}

	&.disabled > * {
		color: #666 !important;
		filter: opacity(0.5);
	}
`;

const OrgTitle = styled.div`
	font-family: TradeGothic;
	font-size: 2.5rem;
	margin: 5px;
	font-weight: 600;
	min-height: 8rem;
	position: relative;
	padding: 0;

	.small & {
		min-height: 3.5rem;
	}

	.big & {
		min-height: 13.5rem;
		font-size: 4rem;
	}

	& > p {
		display: block;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
	}
`;

const OrgAsk = styled.p`
	font-family: TradeGothic20;
	font-size: 3rem;
	font-weight: 700;
`;

const CardContent = styled(Card.Content)`
	background-color: ${props => props.bgcolor} !important;
	color: #FFF;
	text-align: center;

	& a {
		color: #FFF;
	}
`;

const InfoLink = styled(Icon)`
	position: absolute;
	top: 10px;
	right: 10px;
`;

OrgCard.propTypes = {
	org: PropTypes.object,
	overlay: PropTypes.oneOfType([ 
		PropTypes.object,
		PropTypes.bool
	]),
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
};

export default OrgCard;

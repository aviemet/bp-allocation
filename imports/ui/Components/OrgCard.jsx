import React, { useState } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import _ from 'lodash';

import { Card, Icon, Button, Modal, Responsive } from 'semantic-ui-react';
import styled from 'styled-components';

// TODO: Use styledcomponents theme
const GREEN = '#0D8744';
const BLUE = '#002B43';

/**
 * OrgCard Component
 */
const OrgCard = props => {
	// Add animation class if toggled
	// let animateClass = props.animateClass ? 'animate-orgs' : '';

	/*let imagePath = '';
	if(props.image && props.image.path){
		imagePath = Images.link(props.image, 'original', '/');
	}*/

	const [ modalSize, setModalSize ] = useState('large');

	const Overlay = props.overlay || false;
	const Content = props.content || false;

	let bgcolor = GREEN;
	if(props.index) {
		const row = parseInt(props.index / 4) % 4;
		bgcolor = (props.index + (row % 2)) % 2 === 0 ? GREEN : BLUE;
	}

	const cardClass = `${props.size ? props.size : ''} ${props.animateClass ? 'animate-orgs' : ''}`;

	// Default to true, cast to boolean
	const showAsk = _.isUndefined(props.showAsk) ? true : !!props.showAsk;

	const handleOnUpdate = (e, { width }) => {
		let size = 'large';
		if(width <= Responsive.onlyTablet.minWidth) {
			size = 'fullscreen';
		}
		setModalSize(size);
	};

	return (
		<StyledCard className={ cardClass }>
			{ Overlay && <Overlay /> }

			<CardContent bgcolor={ bgcolor } >

				{ props.content && <Card.Content>
					<Content />
				</Card.Content> }

				{ props.info && <InfoLink>
					<Responsive 
						as={ Modal } 
						trigger={ <Button compact circular size='mini' icon='info' /> } 
						closeIcon
						size={ modalSize }
						fireOnMount
						onUpdate={ handleOnUpdate }
					>
						<Modal.Header>{ props.org.title }</Modal.Header>
						<Modal.Content scrolling>{ props.org.description && props.org.description.split(/\n/).map((part, i) => (
							<p key={ i }>{ part }</p>
						) ) }</Modal.Content>
					</Responsive>
				</InfoLink> }

				<OrgTitle><p>{ props.org.title }</p></OrgTitle>
				{ showAsk && <OrgAsk>{ numeral(props.org.ask).format('$0a') }</OrgAsk> }
			</CardContent>
		</StyledCard>
	);
};

const StyledCard = styled(Card)`
	text-align: center;

	&& {
		border: 5px solid #FFF !important;

		.content {
			padding: 1em 0.5em;
		}
	}

	&.big {
		height: 23rem;
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
		min-height: 16rem;
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
	color: '#FFF';
	text-align: center;
`;

const InfoLink = styled(Icon)`
	position: absolute;
	top: 10px;
	right: 10px;
`;

OrgCard.propTypes = {
	image: PropTypes.object,
	org: PropTypes.object,
	overlay: PropTypes.object,
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
	info: PropTypes.bool
};

export default OrgCard;

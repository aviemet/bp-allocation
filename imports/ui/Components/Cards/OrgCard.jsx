import React, { useState } from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'
import styled from '@emotion/styled'
import {
	Box,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Typography,
} from '@mui/material'
import InfoIcon from '@mui/icons-material/InfoOutlined'
// import InfoIcon from '@mui/icons-material/Info'
import { observer } from 'mobx-react-lite'
import { useCardContext } from './OrgCardContainer'

// TODO: Use MUI theme
const GREEN = '#0D8744'
const BLUE = '#002B43'

const OrgCard = observer(({
	children,
	org,
	overlay,
	content,
	index,
	size,
	showAsk,
	animateClass,
	info,
	color = 'green',
	onClick,
	disabled,
	...props
}) => {
	const [infoOpen, setInfoOpen] = useState(false)
	// const { cols } = useCardContext()

	const Overlay = overlay || false
	const Content = content || false

	const cardClasses = ['orgCard']
	if(size) cardClasses.push(size)
	if(animateClass) cardClasses.push('animate-orgs')
	if(disabled) cardClasses.push('disabled')
	if(color) cardClasses.push(color)
	// if(index !== undefined) {
	// 	const row = parseInt(index / cols) % cols
	// 	const parity = (index + (row % 2)) % 2
	// 	cardClasses.push(parity)
	// 	// console.log({ row, index, mod: (index + (row % 2)) % 2 })
	// 	let localBgColor = (index + (row % 2)) % 2 === 0 ? 'green' : 'blue'
	// 	cardClasses.push(localBgColor)
	// }

	return (
		<StyledCard
			className={ cardClasses.join(' ') }
			onClick={ onClick }
			{ ...props }
		>
			{ Overlay && <Overlay /> }

			{ info && <InfoLink>
				<IconButton sx={ { color: 'white' } } aria-label="info" onClick={ () => setInfoOpen(true) }>
					<InfoIcon />
				</IconButton>
				<Dialog
					open={ infoOpen }
					onClose={ () => setInfoOpen(false) }
				>
					<DialogTitle>{ org.title }</DialogTitle>
					<DialogContent>
						<DialogContentText>
							{ org.description && <div dangerouslySetInnerHTML={ { __html: org.description } } /> }
						</DialogContentText>
					</DialogContent>
				</Dialog>
			</InfoLink> }

			<CardContent>

				{ content && <Content /> }

				<OrgTitle>
					<Typography component="h3" variant="h5">{ org.title }</Typography>
				</OrgTitle>
				{ children !== undefined && <OrgAsk>{ children }</OrgAsk> }
				{ showAsk ?? <OrgAsk>{ numeral(org.ask).format('$0a') }</OrgAsk> }
			</CardContent>
		</StyledCard>
	)
})

OrgCard.colors = { GREEN, BLUE }

const StyledCard = styled(Box)(({ theme }) => ({
	position: 'relative',
	border: '2px solid white',
	textAlign: 'center',
	minHeight: '4rem',
	padding: '0.25rem 0.4rem',
	'&.disabled': {
		filter: ' opacity(0.5)',
		'& > *': {
			color: theme.palette.grey[100]
		}
	},
	'&.green': {
		backgroundColor: theme.palette.batteryGreen.main,
	},
	'&.blue': {
		backgroundColor: theme.palette.batteryBlue.main,
	},
	p: {
		margin: 16,
	}
}))

const CardContent = styled(Box)`
	color: #FFF;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	width: 90%;
	margin: 0 auto;

	& a {
		color: #FFF;
	}
`

const OrgTitle = styled.div`
	font-weight: 600;
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;

	h3 {
		font-family: TradeGothic20;
		font-size: clamp(1.75rem, -3rem + 3vw + 4.5vh, 3rem);
		// line-height: clamp(1.75rem, -3rem + 3vw + 4.5vh, 3rem);
		font-weight: 700;
		letter-spacing: -1px;
	}

	.small & {
		min-height: 3.5rem;
	}

	.big & {
		font-size: 3.4rem;
	}
`

const OrgAsk = styled.div`
	font-family: BentonMod;
	font-weight: 700;
	font-size: clamp(1.55rem, -3.15rem + 3vw + 4.5vh, 2.55rem);
`

const InfoLink = styled.div`
	position: absolute;
	top: 0;
	right: 0;
`

OrgCard.propTypes = {
	children: PropTypes.node,
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
	color: PropTypes.oneOf(['green', 'blue']),
	onClick: PropTypes.func,
	rest: PropTypes.any,
}

export default OrgCard

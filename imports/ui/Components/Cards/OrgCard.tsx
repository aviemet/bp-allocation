import React, { useState } from 'react'
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

interface IOrgCardProps {
	children: React.ReactNode
	org: Organization
	overlay?: React.ReactNode
	content: React.ReactNode
	index: number
	size: number|string
	showAsk: boolean
	animateClass: boolean
	info: boolean
	color: 'green'|'blue'
	onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
	disabled: boolean
}

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
}: IOrgCardProps) => {
	const [infoOpen, setInfoOpen] = useState(false)

	const Overlay = overlay || false
	const Content = content || false

	const cardClasses = ['orgCard']
	if(size) cardClasses.push(String(size))
	if(animateClass) cardClasses.push('animate-orgs')
	if(disabled) cardClasses.push('disabled')
	if(color) cardClasses.push(color)

	return (
		<StyledCard
			className={ cardClasses.join(' ') }
			onClick={ e => onClick }
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
			color: theme.palette.grey[100],
		},
	},
	'&.green': {
		backgroundColor: theme.palette.batteryGreen.main,
	},
	'&.blue': {
		backgroundColor: theme.palette.batteryBlue.main,
	},
	p: {
		margin: 16,
	},
}))

const CardContent = styled(Box)`
	color: #FFF;
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
	width: 90%;
	height: 100%;
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

export default OrgCard

import styled from "@emotion/styled"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import {
	Box,
	Dialog,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Typography,
	type BoxProps,
} from "@mui/material"
import { observer } from "mobx-react-lite"
import numeral from "numeral"
import { useState, type ReactElement, type ReactNode } from "react"

import { type OrgData } from "/imports/api/db"

const GREEN = "#0D8744"
const BLUE = "#002B43"

export const OrgCardColors = { GREEN, BLUE }

interface OrgCardProps extends Omit<BoxProps, "onClick" | "content"> {
	children?: ReactNode
	org: OrgData
	overlay?: ReactElement | false
	content?: ReactElement | (() => ReactElement) | false
	index?: number
	size?: string | number
	showAsk?: boolean
	animateClass?: boolean
	info?: boolean
	color?: "green" | "blue"
	onClick?: () => void
	disabled?: boolean
}

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
	color = "green",
	onClick,
	disabled,
	...props
}: OrgCardProps) => {
	const [infoOpen, setInfoOpen] = useState(false)

	const cardClasses = ["orgCard"]
	if(size) cardClasses.push(String(size))
	if(animateClass) cardClasses.push("animate-orgs")
	if(disabled) cardClasses.push("disabled")
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
			className={ cardClasses.join(" ") }
			onClick={ onClick }
			{ ...props }
		>
			{ overlay && overlay }

			{ info && <InfoLink>
				<IconButton sx={ { color: "white" } } aria-label="info" onClick={ () => setInfoOpen(true) }>
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

			<CardContent
				style={ content === undefined ? { height: "100%" } : {} }
			>

				{ content && (typeof content === "function" ? content() : content) }

				<OrgTitle>
					<Typography component="h3" variant="h5">{ org.title }</Typography>
				</OrgTitle>
				{ children !== undefined && <OrgAsk>{ children }</OrgAsk> }
				{ showAsk ?? <OrgAsk>{ numeral(org.ask).format("$0a") }</OrgAsk> }
			</CardContent>
		</StyledCard>
	)
})

const StyledCard = styled(Box)<{ theme?: { palette?: { grey?: Record<number, string>, batteryGreen?: { main: string }, batteryBlue?: { main: string } } } }>(({ theme }) => ({
	position: "relative",
	border: "2px solid white",
	textAlign: "center",
	minHeight: "4rem",
	padding: "0.25rem 0.4rem",
	"&.disabled": {
		filter: " opacity(0.5)",
		"& > *": {
			color: theme?.palette?.grey?.[100] || "#f5f5f5",
		},
	},
	"&.green": {
		backgroundColor: theme?.palette?.batteryGreen?.main || GREEN,
	},
	"&.blue": {
		backgroundColor: theme?.palette?.batteryBlue?.main || BLUE,
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

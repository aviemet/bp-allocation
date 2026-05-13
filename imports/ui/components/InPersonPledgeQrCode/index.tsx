import styled from "@emotion/styled"
import { Box, Button, Stack, Typography } from "@mui/material"
import { Meteor } from "meteor/meteor"
import { QRCodeSVG } from "qrcode.react"
import { useMemo } from "react"

import { useTheme } from "/imports/api/hooks"

const PRINT_FRAME_TITLE = "In-Person Pledge QR Code"
const PRINT_QR_PIXEL_SIZE = 600

interface InPersonPledgeQrCodeProps {
	pixelSize?: number
}

export const InPersonPledgeQrCode = ({ pixelSize = 256 }: InPersonPledgeQrCodeProps) => {
	const { theme, themeLoading } = useTheme()

	const url = useMemo(() => {
		if(!theme?._id) return null
		const host = Meteor.settings?.HOST_URL || (typeof window !== "undefined" ? window.location.origin : "")
		return `${host}/pledges/inperson/${theme._id}`
	}, [theme?._id])

	if(themeLoading || !theme || !url) return null

	const handlePrint = () => {
		const qrSvg = document.getElementById("inPersonPledgeQrCode")
		if(!qrSvg) return
		const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=900")
		if(!printWindow) return
		const serialized = new XMLSerializer().serializeToString(qrSvg)
		printWindow.document.write(`<!doctype html>
<html>
<head>
<title>${PRINT_FRAME_TITLE}</title>
<style>
body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: sans-serif; }
.qr { width: ${PRINT_QR_PIXEL_SIZE}px; height: ${PRINT_QR_PIXEL_SIZE}px; }
.url { margin-top: 1rem; font-size: 1.25rem; word-break: break-all; max-width: ${PRINT_QR_PIXEL_SIZE}px; text-align: center; }
.label { margin-bottom: 1rem; font-size: 1.5rem; }
@media print { body { height: auto; } }
</style>
</head>
<body>
<div class="label">Scan to make an in-person pledge</div>
<div class="qr">${serialized}</div>
<div class="url">${url}</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`)
		printWindow.document.close()
	}

	return (
		<Stack spacing={ 1 } sx={ { alignItems: "center" } }>
			<Box>
				<QRCodeSVG
					id="inPersonPledgeQrCode"
					value={ url }
					size={ pixelSize }
					marginSize={ 2 }
				/>
			</Box>
			<UrlText>{ url }</UrlText>
			<Button onClick={ handlePrint } variant="outlined" size="small">Print QR Code</Button>
			<Typography variant="caption" color="text.secondary">
				Print this and post it in the room. Members scan to access the in-person pledge form.
			</Typography>
		</Stack>
	)
}

const UrlText = styled.div`
	font-family: monospace;
	font-size: 0.85rem;
	color: #444;
	word-break: break-all;
	text-align: center;
`

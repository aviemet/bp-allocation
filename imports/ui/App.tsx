import styled from "@emotion/styled"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider as MUIProvider } from "@mui/material/styles"
import { SnackbarProvider } from "notistack"
import { useEffect } from "react"

import MediaProvider from "./MediaProvider"
import Routes from "./routes"

import theme from "/imports/ui/theme"
import { isMobileDevice } from "/imports/lib/utils"

import { DataProvider } from "/imports/api/providers"

const App = () => {
	useEffect(() => {
		if(isMobileDevice() && typeof globalThis !== "undefined" && globalThis.document) {
			globalThis.document.body.addEventListener("touchmove", function(e) {
				e.preventDefault()
			})
		}
	}, [])

	return (
		<MediaProvider>
			<CssBaseline />

			<MUIProvider theme={ theme }>
				<SnackbarProvider>
					<GlobalContainer id="globalContainer">
						<DataProvider>
							<Routes />
						</DataProvider>
					</GlobalContainer>
				</SnackbarProvider>
			</MUIProvider>
		</MediaProvider>
	)
}

const GlobalContainer = styled.div`
	width: 100%;
	min-height: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
`

export default App

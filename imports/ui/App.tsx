import styled from "@emotion/styled"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider as MUIProvider } from "@mui/material/styles"
import { SnackbarProvider } from "notistack"
import PropTypes from "prop-types"
import React, { useEffect } from "react"

import MediaProvider from "./MediaProvider"
import Routes from "./Routes"

import theme from "/imports/ui/theme"
import { isMobileDevice } from "/imports/lib/utils"

import { DataProvider, ThemeProvider, SettingsProvider, OrgsProvider, MembersProvider, MessagesProvider } from "/imports/api/providers"


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
							<ThemeProvider>
								<SettingsProvider>
									<OrgsProvider>
										<MembersProvider>
											<MessagesProvider>
												<Routes />
											</MessagesProvider>
										</MembersProvider>
									</OrgsProvider>
								</SettingsProvider>
							</ThemeProvider>
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

App.propTypes = {
	match: PropTypes.object,
}

export default App

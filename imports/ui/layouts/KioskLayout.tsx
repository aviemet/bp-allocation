import styled from "@emotion/styled"
import { Container } from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { deepmerge } from "@mui/utils"
import React from "react"

interface KioskLayoutProps {
	children: React.ReactNode
}

const KioskLayout = ({ children }: KioskLayoutProps) => (
	<KioskContainer>
		<ThemeProvider
			theme={ (outerTheme) =>
				createTheme(
					deepmerge(outerTheme, {
						typography: {
							fontFamily: "TradeGothic",
							fontSize: 18,
						},
						palette: {
							primary: { main: "#0D8744" },
							secondary: { main: "#002B43" },
						},
						components: {
							MuiInputBase: {
								styleOverrides: {
									root: { fontFamily: "Roboto" },
								},
							},
						},
					})
				)
			}
		>
			<Container sx={ { minHeight: "100%", display: "flex", pb: 2 } }>
				{ children }
			</Container>
		</ThemeProvider>
	</KioskContainer>
)

const KioskContainer = styled.div`
	width: 100%;
	min-height: 100%;
	background: black;
	color: white;
	touch-action: manipulation;
`

export default KioskLayout

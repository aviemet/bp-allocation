import styled from "@emotion/styled"
import { Container } from "@mui/material"
import { createTheme, ThemeProvider, type ThemeOptions } from "@mui/material/styles"
import { deepmerge } from "@mui/utils"
import { type ReactNode } from "react"

const kioskSurfaceThemeOptions: ThemeOptions = {
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
}

interface KioskLayoutProps {
	children: ReactNode
}

export const KioskLayout = ({ children }: KioskLayoutProps) => (
	<KioskContainer>
		<ThemeProvider
			theme={ (outerTheme) =>
				createTheme(
					deepmerge(outerTheme, kioskSurfaceThemeOptions)
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

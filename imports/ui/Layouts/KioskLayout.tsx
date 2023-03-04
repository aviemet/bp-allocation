import React from 'react'
import { Container } from '@mui/material'
import styled from '@emotion/styled'
import { createTheme, ThemeProvider } from '@mui/material/styles'

interface IKioskLayoutProps {
	children: React.ReactNode
}

const KioskLayout = ({ children }: IKioskLayoutProps) => (
	<KioskContainer>
		<ThemeProvider
			theme={ (theme) =>
				createTheme({
					...theme,
					typography:{
						fontFamily: 'TradeGothic',
						fontSize: 18,
					},
					palette: {
						...theme.palette,
						primary: {
							main: '#0D8744',
						},
						secondary: {
							main: '#002B43',
						},
					},
					components: {
						...theme.components,
						MuiInputBase: {
							styleOverrides: {
								root: {
									fontFamily: 'Roboto',
								},
							},
						},
					},
				})
			}
		>
			<Container sx={ { minHeight: '100%', display: 'flex', pb: 2 } }>
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

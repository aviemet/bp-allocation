import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Routes from './Routes'

import { ThemeProvider as MUIProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import styled from '@emotion/styled'
import theme from '/imports/ui/theme'
import { isMobileDevice } from '/imports/lib/utils'

import { DataProvider, ThemeProvider, SettingsProvider, OrgsProvider, MembersProvider, MessagesProvider } from '/imports/api/providers'
import MediaProvider from './MediaProvider'

import { SnackbarProvider } from 'notistack'

const App = () => {
	useEffect(() => {
		if(isMobileDevice()) {
			document.body.addEventListener('touchmove', function(e) {
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
	match: PropTypes.object
}

export default App

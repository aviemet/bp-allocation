import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import Routes from './Routes'

import styled, { ThemeProvider as StyledProvider } from 'styled-components'
import theme from '/imports/ui/theme'
import { isMobileDevice } from '/imports/lib/utils'

import { DataProvider, ThemeProvider, SettingsProvider, OrgsProvider, MembersProvider, MessagesProvider } from '/imports/api/providers'

const App = () => {
	useEffect(() => {
		if(isMobileDevice()) {
			document.body.addEventListener('touchmove', function(e) { 
				e.preventDefault() 
			})
		}
	}, [])
	
	return (
		<StyledProvider theme={ theme }>
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
		</StyledProvider>
	)
}

const GlobalContainer = styled.div`
	width: 100%;
	height: 100vh;

	table {
		&.ui.table {
			padding: 0;
		}
	}
`

App.propTypes = {
	match: PropTypes.object
}

export default App
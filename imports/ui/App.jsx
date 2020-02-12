import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeProvider } from 'styled-components';
import theme from '/imports/ui/theme';
import DataProvider from '/imports/api/stores/lib/DataProvider';
import AppProvider from '/imports/api/stores/lib/AppDataProvider';
import Routes from './Routes';
import { isMobileDevice } from '/imports/lib/utils';

const App = () => {
	useEffect(() => {
		if(isMobileDevice()) {
			document.body.addEventListener('touchmove', function(e) { 
				e.preventDefault(); 
			});
		}
	}, []);
	return (
		<ThemeProvider theme={ theme }>
			<GlobalContainer id="globalContainer">
				<DataProvider>
					<AppProvider>
						<Routes />
					</AppProvider>
				</DataProvider>
			</GlobalContainer>
		</ThemeProvider>
	);
};

const GlobalContainer = styled.div`
	width: 100%;
	height: 100vh;

	table {
		&.ui.table {
			padding: 0;
		}
	}
`;

App.propTypes = {
	match: PropTypes.object
};

export default App;
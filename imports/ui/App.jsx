import React from 'react';
import PropTypes from 'prop-types';
import styled, { ThemeProvider } from 'styled-components';
import theme from '/imports/lib/theme';
import DataProvider from '/imports/stores/DataProvider';
import Routes from './Routes';

const GlobalContainer = styled.div`
	width: 100%;
	height: 100vh;

	table {
		&.ui.table {
			padding: 0;
		}
	}
`;

const App = () => {
	return (
		<ThemeProvider theme={theme}>
			<GlobalContainer>
				<DataProvider>
					<Routes />
				</DataProvider>
			</GlobalContainer>
		</ThemeProvider>
	);
};

App.propTypes = {
	match: PropTypes.object
};

export default App;
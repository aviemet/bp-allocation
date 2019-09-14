import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import AppProvider from '/imports/stores/AppProvider';
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
		<GlobalContainer>
			<AppProvider>
				<DataProvider>
					<Routes />
				</DataProvider>
			</AppProvider>
		</GlobalContainer>
	);
};

App.propTypes = {
	match: PropTypes.object
};

export default App;
import React from 'react';

import { ThemeContext, ThemeProvider } from './ThemeContext';
import { ImageContext, ImageProvider } from './ImageContext';
import { OrganizationContext, OrganizationProvider }  from './OrganizationContext';
import { PresentationSettingsContext, PresentationSettingsProvider }  from './PresentationSettingsContext';

const AppProvider = (props) => (
	<ThemeProvider id={props.id}>
		<PresentationSettingsProvider id={props.id}>
			<OrganizationProvider id={props.id}>
				<ImageProvider id={props.id}>
					{props.children}
				</ImageProvider>
			</OrganizationProvider>
		</PresentationSettingsProvider>
	</ThemeProvider>
);

export { AppProvider, ThemeContext, ImageContext, OrganizationContext, PresentationSettingsContext };

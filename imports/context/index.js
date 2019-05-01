import React from 'react';

import { ThemeContext, ThemeProvider } from './ThemeContext';
import { ImageContext, ImageProvider } from './ImageContext';
import { OrganizationContext, OrganizationProvider }  from './OrganizationContext';
import { PresentationSettingsContext, PresentationSettingsProvider }  from './PresentationSettingsContext';

const AppProvider = (props) => (
	<ThemeContext.Provider id={props.id}>
		<PresentationSettingsContext id={props.id}>
			<OrganizationContext id={props.id}>
				<ImageContext id={props.id}>
					{props.children}
				</ImageContext>
			</OrganizationContext>
		</PresentationSettingsContext>
	</ThemeContext.Provider>
);

export { AppProvider, ThemeContext, ImageContext, OrganizationContext, PresentationSettingsContext };

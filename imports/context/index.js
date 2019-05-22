import React, { useContext } from 'react';

import { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';
import { PresentationSettingsContext, PresentationSettingsProvider, usePresentationSettings }  from './PresentationSettingsContext';
import { OrganizationContext, OrganizationProvider, useOrganizations }  from './OrganizationContext';
import { ImageContext, ImageProvider, useImages } from './ImageContext';
import { MemberContext, MemberProvider, useMembers }  from './MemberContext';

const AppProvider = props => (
	<ThemeProvider id={props.id}><ThemeContext.Consumer>{theme => (
		<PresentationSettingsProvider id={props.id} handles={theme.handles}><PresentationSettingsContext.Consumer>{settings => (
			<OrganizationProvider id={props.id} handles={settings.handles}><OrganizationContext.Consumer>{orgs => (
				<ImageProvider id={props.id} handles={orgs.handles}><ImageContext.Consumer>{images => (
					<MemberProvider id={props.id} handles={images.handles}>
						{props.children}
					</MemberProvider>
				)}</ImageContext.Consumer></ImageProvider>
			)}</OrganizationContext.Consumer></OrganizationProvider>
		)}</PresentationSettingsContext.Consumer></PresentationSettingsProvider>
	)}</ThemeContext.Consumer></ThemeProvider>
);

export {
	AppProvider,

	ThemeContext,
	ImageContext,
	OrganizationContext,
	MemberContext,
	PresentationSettingsContext,

	useTheme,
	useOrganizations,
	useImages,
	usePresentationSettings,
	useMembers
};

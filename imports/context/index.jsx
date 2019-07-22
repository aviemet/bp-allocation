import React from 'react';
import PropTypes from 'prop-types';

import { ThemeContext, ThemeProvider, useTheme } from './ThemeContext';
import { PresentationSettingsContext, PresentationSettingsProvider, usePresentationSettings }  from './PresentationSettingsContext';
import { OrganizationContext, OrganizationProvider, useOrganizations }  from './OrganizationContext';
import { ImageContext, ImageProvider, useImages } from './ImageContext';
import { MemberContext, MemberProvider, useMembers }  from './MemberContext';

const AppProvider = props => (
	<ThemeProvider id={ props.id }><ThemeContext.Consumer>{theme => (
		<PresentationSettingsProvider id={ props.id } handles={ theme.handles }><PresentationSettingsContext.Consumer>{settings => (
			<MemberProvider id={ props.id } handles={ settings.handles }><MemberContext.Consumer>{members => (
				<OrganizationProvider id={ props.id } handles={ members.handles }><OrganizationContext.Consumer>{orgs => (
					<ImageProvider id={ props.id } handles={ orgs.handles }>
						{ props.children }
					</ImageProvider>
				)}</OrganizationContext.Consumer></OrganizationProvider>
			)}</MemberContext.Consumer></MemberProvider>
		)}</PresentationSettingsContext.Consumer></PresentationSettingsProvider>
	)}</ThemeContext.Consumer></ThemeProvider>
);

AppProvider.propTypes = {
	children: PropTypes.object,
	id: PropTypes.string
};

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

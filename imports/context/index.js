import React, { useContext } from 'react';

import { ThemeContext, ThemeProvider } from './ThemeContext';
import { ImageContext, ImageProvider } from './ImageContext';
import { OrganizationContext, OrganizationProvider }  from './OrganizationContext';
import { MemberContext, MemberProvider }  from './MemberContext';
import { PresentationSettingsContext, PresentationSettingsProvider }  from './PresentationSettingsContext';

const AppProvider = (props) => (
	<ThemeProvider id={props.id}>
		<PresentationSettingsProvider id={props.id}>
			<OrganizationProvider id={props.id}>
				<ImageProvider id={props.id}>
					<MemberProvider id={props.id}>
						{props.children}
					</MemberProvider>
				</ImageProvider>
			</OrganizationProvider>
		</PresentationSettingsProvider>
	</ThemeProvider>
);

const useTheme = () => {
	const { theme, themeLoading } = useContext(ThemeContext);
	return { theme, themeLoading };
};

const useOrganizations = () => {
	const { orgs, topOrgs, orgLoading } = useContext(OrganizationContext);
	return { orgs, topOrgs, orgLoading };
};

const useImages = () => {
	const { images, imagesLoading } = useContext(ImageContext);
	return { images, imagesLoading };
};

const usePresentationSettings = () => {
	const { settings, settingsLoading } = useContext(PresentationSettingsContext);
	return { settings, settingsLoading };
};

const useMembers = () => {
	const { members, membersLoading } = useContext(MemberContext);
	return { members, membersLoading };
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

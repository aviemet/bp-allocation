import React, { useContext } from 'react';
import AppTracker from './AppTracker';
import PropTypes from 'prop-types';
import { Loader } from 'semantic-ui-react';

export const ThemeContext                = React.createContext();
export const PresentationSettingsContext = React.createContext();
export const MemberContext               = React.createContext();
export const OrganizationContext         = React.createContext();
export const ImageContext                = React.createContext();

export const useTheme    = () => useContext(ThemeContext);
export const useSettings = () => useContext(PresentationSettingsContext);
export const useMembers  = () => useContext(MemberContext);
export const useOrgs     = () => useContext(OrganizationContext);
export const useImages   = () => useContext(ImageContext);

const AppProvider = ({ themeId, loading, theme, settings, members, orgs, images, children }) => {

	if(!themeId) return <>{ children }</>;

	if(loading) return <Loader />;

	return(
		<ThemeContext.Provider value={ theme }>
			<PresentationSettingsContext.Provider value={ settings }>
				<MemberContext.Provider value={ members }>
					<OrganizationContext.Provider value={ orgs }>
						<ImageContext.Provider value={ images }>
							{ children }
						</ImageContext.Provider>
					</OrganizationContext.Provider>
				</MemberContext.Provider>
			</PresentationSettingsContext.Provider>
		</ThemeContext.Provider>
	);
};

AppProvider.propTypes = {
	themeId: PropTypes.string,
	loading: PropTypes.bool,
	children: PropTypes.any,
	theme: PropTypes.object, 
	settings: PropTypes.object, 
	members: PropTypes.array, 
	orgs: PropTypes.array, 
	images: PropTypes.array
};

export default AppTracker(AppProvider);
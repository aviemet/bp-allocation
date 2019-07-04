import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom';
import { Transition } from 'react-transition-group';

import { Loader } from 'semantic-ui-react';
import styled from 'styled-components';

import { ThemeContext, OrganizationContext, PresentationSettingsContext, ImageContext } from '/imports/context';

import { Intro, Orgs, Timer, TopOrgs, Allocation, Results } from '/imports/ui/Presentation/Pages';

// Transition group definitions
const FADE_DURATION = 300;

const defaultStyle = {
	transition: `opacity ${FADE_DURATION}ms ease-in-out`,
	opacity: 0
};

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 }
};

const PageFader = styled.div`
	opacity: 0;
`;

const Presentation = props => {

	const { theme, themeLoading } = useContext(ThemeContext);
	const { orgsLoading } = useContext(OrganizationContext);
	const { settings, settingsLoading } = useContext(PresentationSettingsContext);
	const { imagesLoading } = useContext(ImageContext);

	const [ show, setShow ] = useState(true);

	const loading = (themeLoading || orgsLoading || settingsLoading || imagesLoading);

	useEffect(() => {
		if(!loading) {
			doNavigation();
		}
	});

	// TODO: wait for image load before showing page
	const doNavigation = () => {
		let page = `/presentation/${theme._id}/${settings.currentPage}`;
		if(location.pathname !== page && show){
			setShow(false);

			setTimeout(() => {
				props.history.push(page);
				setShow(true);
			}, FADE_DURATION);
		}
	};

	if(loading) {
		return <Loader />;
	}

	return (
		<Transition in={ show } timeout={ FADE_DURATION }>
			{(state) => (
				<PageFader style={ { ...defaultStyle, ...transitionStyles[state] } }>
					{/* Intro */}
					<Route path={ `${props.match.path}/intro` } render={ (props) => (
						<Intro title={ theme.title } question={ theme.question } />
					) } />

					{/* Participating Organizations */}
					<Route exact path={ `${props.match.path}/orgs` } component={ Orgs } />

					{/* Timer */}
					<Route exact path={ `${props.match.path}/timer` } render={ (props) => (
						<Timer seconds={ settings.timerLength } />
					) } />

					{/* Top Orgs */}
					<Route exact path={ `${props.match.path}/toporgs` } component={ TopOrgs } />

					{/* Allocation */}
					<Route exact path={ `${props.match.path}/allocation` } component={ Allocation } />

					{/* Results */}
					<Route exact path={ `${props.match.path}/results` } component={ Results } />

				</PageFader>
			)}
		</Transition>
	);
};

Presentation.propTypes = {
	history: PropTypes.object,
	match: PropTypes.object
};

export default withRouter(Presentation);



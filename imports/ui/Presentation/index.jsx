import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Route, withRouter } from 'react-router-dom'
import { Transition } from 'react-transition-group'

import { observer } from 'mobx-react-lite'
import { useTheme, useSettings } from '/imports/api/providers'

import styled from '@emotion/styled'

import { Intro, Orgs, Timer, TopOrgs, Allocation, Results } from '/imports/ui/Presentation/Pages'
import { CircularProgress } from '@mui/material'

// Transition group definitions
const FADE_DURATION = 300

const defaultStyle = {
	transition: `opacity ${FADE_DURATION}ms ease-in-out`,
	opacity: 0
}

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 }
}

const PageFader = styled.div`
	opacity: 0;
`

const Presentation = withRouter(observer(props => {
	const { theme, isLoading: themeLoading } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()

	const [ show, setShow ] = useState(true)

	useEffect(() => {
		if(!settingsLoading) doNavigation(settings.currentPage)
	}, [settings.currentPage, settingsLoading])

	// TODO: wait for image load before showing page
	const doNavigation = currentPage => {
		let page = `/presentation/${theme._id}/${currentPage}`
		if(location.pathname !== page && show){
			setShow(false)

			setTimeout(() => {
				props.history.push(page)
				setShow(true)
			}, FADE_DURATION)
		}
	}

	// Component doesn't update from mobx changes unless they are referenced
	const title = theme.title || ''
	const question = theme.question || ''

	if(themeLoading || settingsLoading) return <CircularProgress />
	return (
		<Transition in={ show } timeout={ FADE_DURATION }>
			{(state) => (
				<PageFader style={ { ...defaultStyle, ...transitionStyles[state] } }>
					{/* Intro */}
					<Route path={ `${props.match.path}/intro` } render={ () => (
						<Intro title={ title } question={ question } />
					) } />

					{/* Participating Organizations */}
					<Route exact path={ `${props.match.path}/orgs` } component={ Orgs } />

					{/* Timer */}
					<Route exact path={ `${props.match.path}/timer` } render={ () => (
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
	)
}))

Presentation.propTypes = {
	history: PropTypes.object,
	match: PropTypes.object
}

export default Presentation

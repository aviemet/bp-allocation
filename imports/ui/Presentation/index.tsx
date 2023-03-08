import React, { useState, useEffect } from 'react'
import { Route, useLocation, useNavigate } from 'react-router-dom'
import { Transition } from 'react-transition-group'
import { observer } from 'mobx-react-lite'
import { useTheme, useSettings } from '/imports/api/providers'
import styled from '@emotion/styled'
import { Intro, Orgs, Timer, TopOrgs, Allocation, Results } from '/imports/ui/Presentation/Pages'
import { Loading } from '/imports/ui/Components'

const Presentation = observer(() => {
	const location = useLocation()
	const navigate = useNavigate()
	const { theme, isLoading: themeLoading } = useTheme()
	const { settings, isLoading: settingsLoading } = useSettings()

	const [ show, setShow ] = useState(true)

	useEffect(() => {
		if(!settingsLoading) doNavigation(settings.currentPage)
	}, [settings.currentPage, settingsLoading])

	const doNavigation = (currentPage: string) => {
		let page = `/presentation/${theme._id}/${currentPage}`
		if(location.pathname !== page && show){
			setShow(false)

			setTimeout(() => {
				navigate(page)
				setShow(true)
			}, FADE_DURATION)
		}
	}

	// Component doesn't update from mobx changes unless they are referenced
	const title = theme.title || ''
	const question = theme.question || ''

	if(themeLoading || settingsLoading) return <Loading />
	return (
		<Transition in={ show } timeout={ FADE_DURATION }>
			{ (state) => (
				<PageFader style={ { ...defaultStyle, ...transitionStyles[state], width: '100%' } } id="presentationFader">
					{ /* Intro */ }
					<Route path={ `${location}/intro` } element={ <Intro title={ title } question={ question } /> } />

					{ /* Participating Organizations */ }
					<Route path={ `${location}/orgs` } element={ <Orgs /> } />

					{ /* Timer */ }
					<Route path={ `${location}/timer` } element={ <Timer seconds={ settings.timerLength } /> } />

					{ /* Top Orgs */ }
					<Route path={ `${location}/toporgs` } element={ <TopOrgs /> } />

					{ /* Allocation */ }
					<Route path={ `${location}/allocation` } element={ <Allocation /> } />

					{ /* Results */ }
					<Route path={ `${location}/results` } element={ <Results /> } />

				</PageFader>
			) }
		</Transition>
	)
})


// Transition group definitions
const FADE_DURATION = 300

const defaultStyle = {
	transition: `opacity ${FADE_DURATION}ms ease-in-out`,
	opacity: 0,
}

const transitionStyles = {
	entering: { opacity: 0 },
	entered: { opacity: 1 },
}

const PageFader = styled.div`
	opacity: 0;
`

export default Presentation

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react-lite'
import { useData, useTheme, useOrgs, useSettings } from '/imports/api/providers'
import { Route, Redirect, useRouteMatch } from 'react-router-dom'
import { Loading } from '/imports/ui/Components'

// Route which delays display of content until the theme data has fully loaded
// Used for all views besides Admin
const LoadingRoute = observer(({ component, render, children, path, ...rest }) => {
	const data = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	const { isLoading: orgsLoading } = useOrgs()
	const { isLoading: settingsLoading } = useSettings()

	const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

	// Allow for any of the methods for passing components
	const Component = render || component || children

	const match = useRouteMatch(path)

	useEffect(() => {
		data.themeId = match.params.id || undefined
	}, [match.params.id])

	useEffect(() => {
		const loadingTest = themeLoading || orgsLoading || settingsLoading
		if(loadingTest !== isLoading) {
			setIsLoading(loadingTest)
		}
	}, [themeLoading, orgsLoading, settingsLoading])

	return (
		<Route { ...rest } render={ () => {
			if(match.params.id !== undefined && isLoading) {
				return <Loading />
			} else if(match.params.id !== undefined && !theme) {
				return <Redirect to='/404' />
			}
			return <Component />
		} } />
	)
})

LoadingRoute.propTypes = {
	component: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]),
	render: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]),
	children: PropTypes.oneOfType([ PropTypes.element, PropTypes.node, PropTypes.func ]),
	path: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
	rest: PropTypes.any
}

export default LoadingRoute

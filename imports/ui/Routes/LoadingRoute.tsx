import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useData, useTheme, useOrgs, useSettings } from '/imports/api/providers'
import { Route, Redirect, useRouteMatch, type RouteProps } from 'react-router-dom'
import { Loading } from '/imports/ui/Components'

interface ILoadingRoute extends RouteProps {
	path: string | string[]
}

// Route which delays display of content until the theme data has fully loaded
// Used for all views besides Admin
const LoadingRoute = observer(({ component, render, children, path, ...rest }: ILoadingRoute) => {
	const data = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	const { isLoading: orgsLoading } = useOrgs()
	const { isLoading: settingsLoading } = useSettings()

	const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

	// Allow for any of the methods for passing components
	const Component = render || component || children

	const match = useRouteMatch(path)

	useEffect(() => {
		if(!match) return

		data.themeId = match.params.id || undefined
	}, [match?.params])

	useEffect(() => {
		const loadingTest = themeLoading || orgsLoading || settingsLoading
		if(loadingTest !== isLoading) {
			setIsLoading(loadingTest)
		}
	}, [themeLoading, orgsLoading, settingsLoading])

	return (
		<Route { ...rest } render={ () => {
			if(match?.params.id !== undefined && isLoading) {
				return <Loading />
			} else if(match?.params.id !== undefined && !theme) {
				return <Redirect to='/404' />
			}
			return <Component />
		} } />
	)
})

export default LoadingRoute

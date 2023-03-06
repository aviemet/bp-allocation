import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useData, useTheme, useOrgs, useSettings } from '/imports/api/providers'
import { Redirect, Route, useRoute, useLocation } from 'wouter'
import { Loading } from '/imports/ui/Components'

interface ILoadingRoute {
	children: React.ReactNode
	path: string
}

// Route which delays display of content until the theme data has fully loaded
// Used for all views besides Admin
const LoadingRoute = observer(({ children, path }: ILoadingRoute) => {
	const data = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	const { isLoading: orgsLoading } = useOrgs()
	const { isLoading: settingsLoading } = useSettings()

	const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

	const [location, setLocation] = useLocation()
	const [match, params] = useRoute('/admin/:id')

	useEffect(() => {
		if(!params?.id) return

		data.themeId = params.id
	}, [params])

	useEffect(() => {
		const loadingTest = themeLoading || orgsLoading || settingsLoading
		if(loadingTest !== isLoading) {
			setIsLoading(loadingTest)
		}
	}, [themeLoading, orgsLoading, settingsLoading])

	useEffect(() => {
		if(!isLoading && !theme) {
			setLocation('/404')
		}
	}, [isLoading])

	return (
		<Route path={ path }>{ isLoading ?
			<Loading />
			:
			<>{ children }</>
		}</Route>
	)

	if(params?.id && isLoading) {
		return <Loading />
	} else if(params?.id && !theme) {
		return <Redirect to='/404' />
	}
	return <>{ children }</>

})

export default LoadingRoute

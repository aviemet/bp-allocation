import React, { useCallback, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useData, useTheme, useOrgs, useSettings } from '/imports/api/providers'
import { Outlet, Route, RouteProps, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Loading } from '/imports/ui/Components'

// Route which delays display of content until the theme data has fully loaded
// Used for all views besides Admin
const LoadingRoute = () => {
	const params = useParams()
	const navigate = useNavigate()

	const data = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	const { isLoading: orgsLoading } = useOrgs()
	const { isLoading: settingsLoading } = useSettings()

	const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

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
			navigate('/404')
		}
	}, [isLoading])

	if(isLoading) return <Loading />
	return <Outlet />
}

export default observer(LoadingRoute)

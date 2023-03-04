import React, { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useData, useTheme, useOrgs, useSettings } from '/imports/api/providers'
import { Navigate, useParams } from 'react-router-dom'
import { Loading } from '/imports/ui/Components'

interface ILoadingRoute {
	children: React.ReactNode
	path: string | string[]
}

// Route which delays display of content until the theme data has fully loaded
// Used for all views besides Admin
const LoadingRoute = observer(({ children, path, ...props }: ILoadingRoute) => {
	const data = useData()
	const { theme, isLoading: themeLoading } = useTheme()
	const { isLoading: orgsLoading } = useOrgs()
	const { isLoading: settingsLoading } = useSettings()

	const [isLoading, setIsLoading] = useState(themeLoading || orgsLoading || settingsLoading)

	const { id } = useParams()

	useEffect(() => {
		if(!id) return

		data.themeId = id
	}, [id])

	useEffect(() => {
		const loadingTest = themeLoading || orgsLoading || settingsLoading
		if(loadingTest !== isLoading) {
			setIsLoading(loadingTest)
		}
	}, [themeLoading, orgsLoading, settingsLoading])

	if(id && isLoading) {
		return <Loading />
	} else if(id && !theme) {
		return <Navigate to='/404' />
	}
	return <>{ children }</>

})

export default LoadingRoute

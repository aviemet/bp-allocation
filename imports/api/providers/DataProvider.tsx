import React from 'react'
import PropTypes from 'prop-types'
import AppStore from '/imports/api/stores/AppStore'
import { createContext } from '/imports/lib/hooks'

export const [useData, DataProvider] = createContext<AppStore>()

const appStore = new AppStore()

const DataProviderComponent = ({ children }: { children: React.ReactNode }) => {
	return (
		<DataProvider value={ appStore }>
			{ children }
		</DataProvider>
	)
}

DataProviderComponent.propTypes = {
	children: PropTypes.any,
}

export default DataProviderComponent

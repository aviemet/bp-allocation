import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import AppStore from '/imports/api/stores/AppStore'

export const DataContext = React.createContext()
export const useData = () => useContext(DataContext)

const appStore = new AppStore()

const DataProvider = props => {
	return (
		<DataContext.Provider value={ appStore }>
			{ props.children }
		</DataContext.Provider>
	)
}

DataProvider.propTypes = {
	children: PropTypes.any
}

export default DataProvider
import React, { useContext } from "react"
import PropTypes from "prop-types"

import AppStore from "/imports/api/stores/AppStore"

import { configure } from "mobx"

configure({
	useProxies: "never",
})

export const DataContext = React.createContext({})
export const useData = () => useContext(DataContext)

const appStore = new AppStore()

const DataProvider = ({ children }) => {
	return (
		<DataContext.Provider value={ appStore }>
			{ children }
		</DataContext.Provider>
	)
}

DataProvider.propTypes = {
	children: PropTypes.any,
}

export default DataProvider

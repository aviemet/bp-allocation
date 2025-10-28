import { configure } from "mobx"
import React from "react"

import AppStore from "/imports/api/stores/AppStore"
import { createContext } from "/imports/lib/hooks/createContext"

configure({
	useProxies: "never",
})

const [useData, DataContextProvider] = createContext<AppStore>()
export { useData }

const appStore = new AppStore()

interface DataProviderProps {
	children: React.ReactNode
}

const DataProvider = ({ children }: DataProviderProps) => {
	return (
		<DataContextProvider value={ appStore }>
			{ children }
		</DataContextProvider>
	)
}

export default DataProvider

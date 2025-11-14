import React, { useState, useCallback } from "react"

import { createContext } from "/imports/lib/hooks/createContext"

interface AppData {
	themeId: string | null
	setThemeId: (id: string | null) => void
	menuHeading: string
	setMenuHeading: (heading: string) => void
	votingRedirectTimeout: number
	setVotingRedirectTimeout: (timeout: number) => void
	resetVotingRedirectTimeout: () => void
	defaultMenuHeading: string
	KIOSK_PAGES: { info: "info", chit: "chit", funds: "funds", topups: "topups", results: "results" }
	defaultVotingRedirectTimeout: number
}

const [useData, DataContextProvider] = createContext<AppData>()
export { useData }

interface DataProviderProps {
	children: React.ReactNode
}

const DataProvider = ({ children }: DataProviderProps) => {
	const [themeId, setThemeId] = useState<string | null>(null)
	const [menuHeading, setMenuHeading] = useState<string>("Battery Powered Allocation Night Themes")
	const [votingRedirectTimeout, setVotingRedirectTimeout] = useState<number>(60)

	const defaultMenuHeading = "Battery Powered Allocation Night Themes"
	const defaultVotingRedirectTimeout = 60

	const resetVotingRedirectTimeout = useCallback(() => {
		setVotingRedirectTimeout(defaultVotingRedirectTimeout)
	}, [])

	const value: AppData = {
		themeId,
		setThemeId,
		menuHeading,
		setMenuHeading,
		votingRedirectTimeout,
		setVotingRedirectTimeout,
		resetVotingRedirectTimeout,
		defaultMenuHeading,
		KIOSK_PAGES: { info: "info", chit: "chit", funds: "funds", topups: "topups", results: "results" },
		defaultVotingRedirectTimeout,
	}

	return (
		<DataContextProvider value={ value }>
			{ children }
		</DataContextProvider>
	)
}

export default DataProvider

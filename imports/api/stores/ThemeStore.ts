import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Theme } from "/imports/types"

export interface ThemeWithVotingDefaults extends Theme {
	numTopOrgs: number
	topOrgsManual: string[]
}

export type ThemeData = TrackableData<ThemeWithVotingDefaults>
type ThemeStoreInit = TrackableData<Theme>

const initializeThemeData = (data: ThemeStoreInit): ThemeData => {
	const numTopOrgs = typeof data.numTopOrgs === "number" && Number.isFinite(data.numTopOrgs) ? Math.max(Math.floor(data.numTopOrgs), 0) : 0
	const topOrgsManual = Array.isArray(data.topOrgsManual) ? data.topOrgsManual.filter((value): value is string => typeof value === "string") : []

	return {
		...data,
		numTopOrgs,
		topOrgsManual,
	}
}

class ThemeStore extends TrackableStore<ThemeData> {
	constructor(data: ThemeStoreInit) {
		super(initializeThemeData(data))
	}
}

interface ThemeStore extends ThemeData {}

export default ThemeStore
export { initializeThemeData }

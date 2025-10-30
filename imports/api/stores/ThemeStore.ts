import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Theme } from "/imports/types"

export type ThemeData = TrackableData<Theme>

class ThemeStore extends TrackableStore<ThemeData> {
	constructor(data: ThemeData) {
		super(data)
	}
}

interface ThemeStore extends ThemeData {}

export default ThemeStore

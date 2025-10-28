import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Theme } from "/imports/api/db/generated-types"

interface ThemeData extends Theme, TrackableData {}

class ThemeStore extends TrackableStore<ThemeData> {
	constructor(data: ThemeData) {
		super(data)
	}
}

export default ThemeStore

import TrackableStore from "./lib/TrackableStore"
import { ThemeData } from "/imports/api/db"

class ThemeStore extends TrackableStore<ThemeData> {
	constructor(data: ThemeData) {
		super(data)
	}
}

export default ThemeStore

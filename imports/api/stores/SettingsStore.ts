import TrackableStore from "./lib/TrackableStore"
import { SettingsData } from "/imports/api/db"

class SettingsStore extends TrackableStore<SettingsData> {
	constructor(data: SettingsData) {
		super(data)
	}
}

export default SettingsStore

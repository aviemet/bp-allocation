import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { PresentationSettings } from "/imports/api/db/generated-types"

interface SettingsData extends PresentationSettings, TrackableData {}

class SettingsStore extends TrackableStore<SettingsData> {
	constructor(data: SettingsData) {
		super(data)
	}
}

export default SettingsStore

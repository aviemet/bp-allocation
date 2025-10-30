import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { PresentationSettings } from "/imports/types"

export type SettingsData = TrackableData<PresentationSettings>

class SettingsStore extends TrackableStore<SettingsData> {
	constructor(data: SettingsData) {
		super(data)
	}
}

interface SettingsStore extends SettingsData {}

export default SettingsStore

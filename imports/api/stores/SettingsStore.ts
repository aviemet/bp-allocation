import TrackableStore from './lib/TrackableStore'

interface SettingsStore extends Schema.PresentationSettings {}

class SettingsStore extends TrackableStore<SettingsStore> implements SettingsStore {}

export default SettingsStore

import TrackableStore from './lib/TrackableStore'

interface SettingsStore extends PresentationSettings {}

class SettingsStore extends TrackableStore<SettingsStore> implements SettingsStore {}

export default SettingsStore

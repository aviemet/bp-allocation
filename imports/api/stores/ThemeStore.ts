import TrackableStore from './lib/TrackableStore'

interface ThemeStore extends Theme {}

class ThemeStore extends TrackableStore<ThemeStore> implements ThemeStore {}

export default ThemeStore

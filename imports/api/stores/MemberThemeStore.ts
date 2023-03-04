import TrackableStore from './lib/TrackableStore'

interface MemberThemeStore extends MemberTheme {}

class MemberThemeStore extends TrackableStore<MemberThemeStore> implements MemberThemeStore {}

export default MemberThemeStore

import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { MemberTheme } from "/imports/types/schema"

interface MemberThemeData extends MemberTheme, TrackableData {}

class MemberThemeStore extends TrackableStore<MemberThemeData> {
	constructor(data: MemberThemeData) {
		super(data)
	}
}

export default MemberThemeStore

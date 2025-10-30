import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { MemberTheme } from "/imports/types/schema"

export type MemberThemeData = TrackableData<MemberTheme>

class MemberThemeStore extends TrackableStore<MemberThemeData> {
	constructor(data: MemberThemeData) {
		super(data)
	}
}

interface MemberThemeStore extends MemberThemeData {}

export default MemberThemeStore

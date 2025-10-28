import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { MemberTheme } from "/imports/api/db/generated-types"

interface MemberThemeData extends MemberTheme, TrackableData {}

class MemberThemeStore extends TrackableStore<MemberThemeData> {
	constructor(data: MemberThemeData) {
		super(data)
	}
}

export default MemberThemeStore

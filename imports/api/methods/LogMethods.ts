import { ValidatedMethod } from "meteor/mdg:validated-method"
import { Meteor } from "meteor/meteor"

import { Logs } from "/imports/api/db"
import { consoleLog } from "/imports/lib/logging"

interface PurgeData {
	themeId: string
}

interface PurgeResult {
	removed: number
}

export const LogMethods = {
	purge: new ValidatedMethod({
		name: "logs.purge",

		validate: null,

		async run({ themeId }: PurgeData): Promise<PurgeResult> {
			if(!Meteor.isServer) return { removed: 0 }
			if(typeof themeId !== "string" || themeId.length === 0) {
				throw new Meteor.Error("logs.purge.invalidTheme", "`themeId` must be a non-empty string")
			}

			const removed = await Logs.removeAsync({ themeId })
			consoleLog.log("logs.purge: Purged logs for theme", { themeId, removed })
			return { removed }
		},
	}),
}

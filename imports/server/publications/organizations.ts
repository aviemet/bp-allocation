import { Meteor } from "meteor/meteor"

import { type PublishSelf } from "../methods"
import { runThemeOrgPublication } from "./orgPublicationShared"

const publishOrganizations = async (themeId: string, publisher: PublishSelf) => {
	await runThemeOrgPublication(
		themeId,
		publisher,
		"organizations",
		transformed => transformed,
	)
}

Meteor.publish("organizations", async function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	await publishOrganizations(themeId, this)
})

import { Meteor } from "meteor/meteor"

import { type PublishSelf } from "../methods"
import { runThemeOrgPublication } from "./orgPublicationShared"

const PLEDGE_FUNDING_COLLECTION = "orgPledgeFunding"

const toPledgeFundingFields = (transformed: Record<string, unknown>): Record<string, unknown> => ({
	_id: transformed._id,
	theme: transformed.theme,
	need: transformed.need,
})

const publishOrganizationsPledgeFunding = async (themeId: string, publisher: PublishSelf) => {
	await runThemeOrgPublication(
		themeId,
		publisher,
		PLEDGE_FUNDING_COLLECTION,
		toPledgeFundingFields,
	)
}

Meteor.publish("organizations.pledgeFunding", async function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	await publishOrganizationsPledgeFunding(themeId, this)
})

import { Meteor } from "meteor/meteor"

import { registerObserver, type PublishSelf } from "../methods"
import { OrgTransformer } from "/imports/server/transformers"

import {
	Organizations,
	Themes,
	MemberThemes,
	PresentationSettings,
	type OrgData,
	type ThemeData,
	type SettingsData,
} from "/imports/api/db"
import { type MemberTheme } from "/imports/types/schema"

interface OrgObserverParams {
	theme?: ThemeData
	settings?: SettingsData
	memberThemes: MemberTheme[]
}

const orgObserver = registerObserver((doc: OrgData, params: OrgObserverParams) => {
	if(!doc.theme) return { ...doc }

	return OrgTransformer(doc, params)
})

const publishOrganizations = async (themeId: string, publisher: PublishSelf) => {
	const theme = await Themes.findOneAsync({ _id: themeId })
	if(!theme) {
		publisher.ready()
		return
	}

	const settings = theme.presentationSettings ? await PresentationSettings.findOneAsync({ _id: theme.presentationSettings }) : undefined
	const memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()

	const observerCallbacks = orgObserver("organizations", publisher, { theme, settings, memberThemes })

	const orgsCursor = Organizations.find({ theme: themeId }).observe(observerCallbacks)

	publisher.onStop(() => {
		if(orgsCursor && typeof orgsCursor.stop === "function") {
			orgsCursor.stop()
		}
	})

	publisher.ready()
}

Meteor.publish("organizations", async function(themeId: string) {
	if(!themeId) {
		this.ready()
		return
	}

	await publishOrganizations(themeId, this)
})

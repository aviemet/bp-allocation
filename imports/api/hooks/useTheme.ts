import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { Themes, type ThemeData } from "../db"
import { type PledgeWithOrg } from "./useOrgs"
import { useData } from "../providers/DataProvider"

export interface ThemeWithComputed extends ThemeData {
	pledgedTotal?: number
	votedFunds?: number
	fundsVotesCast?: number
	chitVotesCast?: number
	totalChitVotes?: number
	totalMembers?: number
	fundsVotingStarted?: boolean
	chitVotingStarted?: boolean
	leverageRemaining?: number
	memberFunds?: number
	consolationTotal?: number
	topOrgs?: string[]
	pledges?: PledgeWithOrg[]
}

export const useTheme = () => {
	const data = useData()
	const themeId = data?.themeId

	return useTracker((): {
		theme: ThemeWithComputed | undefined
		themeLoading: boolean
	} => {
		if(!themeId) {
			return {
				theme: undefined,
				themeLoading: true,
			}
		}

		const subscription = Meteor.subscribe("theme", themeId)
		const subscriptionReady = subscription.ready()
		const themeRaw = Themes.findOne({ _id: themeId })

		if(!subscriptionReady || !themeRaw) {
			return {
				theme: undefined,
				themeLoading: !subscriptionReady,
			}
		}

		function hasComputedProperties(theme: ThemeData): theme is ThemeWithComputed {
			return (
				"topOrgs" in theme
			)
		}

		if(!hasComputedProperties(themeRaw)) {
			return {
				theme: undefined,
				themeLoading: true,
			}
		}

		return {
			theme: themeRaw,
			themeLoading: false,
		}
	}, [themeId])
}


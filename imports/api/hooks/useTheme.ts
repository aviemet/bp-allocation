import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import { Themes, type ThemeData } from "../db"
import { useData } from "../providers/DataProvider"
import { initializeThemeData } from "../stores/ThemeStore"

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

		const initializedTheme = initializeThemeData(themeRaw)

		const theme: ThemeWithComputed = {
			...initializedTheme,
			pledgedTotal: themeRaw.pledgedTotal,
			votedFunds: themeRaw.votedFunds,
			fundsVotesCast: themeRaw.fundsVotesCast,
			chitVotesCast: themeRaw.chitVotesCast,
			totalChitVotes: themeRaw.totalChitVotes,
			totalMembers: themeRaw.totalMembers,
			fundsVotingStarted: themeRaw.fundsVotingStarted,
			chitVotingStarted: themeRaw.chitVotingStarted,
			leverageRemaining: themeRaw.leverageRemaining,
			memberFunds: themeRaw.memberFunds,
			consolationTotal: themeRaw.consolationTotal,
			topOrgs: themeRaw.topOrgs,
		}

		return {
			theme,
			themeLoading: false,
		}
	}, [themeId])
}


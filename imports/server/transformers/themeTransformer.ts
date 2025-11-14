import { isEmpty, sortBy } from "lodash"
import { roundFloat } from "/imports/lib/utils"

import { type ThemeData, type SettingsData } from "/imports/api/db"
import { type MemberTheme, type MatchPledge } from "/imports/types/schema"
import { type OrgWithComputed } from "./orgTransformer"

/**
 * Document transformer for records in the Theme table
 * @param {Object} doc Object in iterating array of objects to altered
 * @param {Object} params { topOrgs, memberThemes, settings }
 */
export interface ThemeTransformerParams {
	topOrgs: OrgWithComputed[]
	memberThemes: MemberTheme[]
	settings: SettingsData
}

export interface PledgeWithOrg extends MatchPledge {
	org: {
		_id: string
		title: string
	}
	[key: string]: unknown
}

export interface ThemeWithComputed extends ThemeData {
	pledgedTotal: number
	votedFunds: number
	fundsVotesCast?: number
	chitVotesCast?: number
	totalChitVotes?: number
	totalMembers: number
	fundsVotingStarted: boolean
	chitVotingStarted: boolean
	leverageRemaining: number
	memberFunds: number
	consolationTotal: number
	topOrgs: string[]
	pledges: PledgeWithOrg[]
	[key: string]: unknown
}

const ThemeTransformer = (doc: ThemeData, params: ThemeTransformerParams): ThemeWithComputed => {
	// Pledged total
	const pledgedTotal = params.topOrgs.reduce((total, org) => {
		if(org.pledges) {
			return total + org.pledges.reduce((sum, pledge) => { return sum + (pledge.amount || 0) }, 0)
		}
		return total
	}, 0)

	// Total amount of dollar votes
	let votedFunds = 0
	if(params.settings.useKioskFundsVoting) {
		// Calculate based on individual votes if using kiosk method
		votedFunds = params.memberThemes.reduce((voteAllocated, member) => {
			return voteAllocated + (member.allocations || []).reduce((sum, allocation) => { return (allocation.amount || 0) + sum }, 0)
		}, 0)
	} else {
		// Calculate total count if not using kiosk method
		votedFunds = params.topOrgs.reduce((sum, org) => {
			return sum + Number(org.votedTotal || 0)
		}, 0)
	}

	// Total amount of members who have voted their funds
	const fundsVotesCast = params.settings.useKioskFundsVoting
		? params.memberThemes.reduce((sum, member) => {
			return member.allocations && member.allocations.length > 0 ? sum + 1 : sum
		}, 0)
		: undefined

	// Total amount of members who have voted their chits
	const chitVotesCast = params.settings.useKioskChitVoting
		? params.memberThemes.reduce((sum, member) => {
			return member.chitVotes && member.chitVotes.length > 0 ? sum + 1 : sum
		}, 0)
		: undefined

	// Total amount of chits to be voted
	const totalChitVotes = params.settings.useKioskChitVoting
		? params.memberThemes.reduce((sum, member) => {
			return member.chits ? sum + member.chits : sum
		}, 0)
		: undefined

	// Total amount of members voting in this theme
	const totalMembers = params.memberThemes.length

	// Whether voting has begun - True if at least one person has cast a vote
	const fundsVotingStarted = params.memberThemes.some(member => {
		return (member.allocations || []).some(vote => (vote.amount || 0) > 0)
	})

	// Whether voting has begun - True if at least one person has cast a vote
	const chitVotingStarted = params.memberThemes.some(member => {
		return (member.chitVotes || []).some(vote => (vote.votes || 0) > 0)
	})

	// Amount given to orgs other than top orgs
	const consolationTotal = doc.consolationActive ? ((doc.organizations ? doc.organizations.length : 0) - (doc.numTopOrgs || 0)) * (doc.consolationAmount || 0) : 0

	// Amount of the total pot still unassigned
	let remainingLeverage = (doc.leverageTotal || 0) - consolationTotal - votedFunds

	// Subtract the amounts allocated to each org
	params.topOrgs.forEach((org) => {
		// The topoff for the crowd favorite
		if((org.topOff || 0) > 0) {
			remainingLeverage -= (org.topOff || 0)
		}

		// Individual pledges from members
		if(org.pledges && !isEmpty(org.pledges)) {
			remainingLeverage -= org.pledges.reduce((sum, pledge) => {
				const amount = pledge.amount || 0
				const matchRatio = doc.matchRatio || 0
				return sum + (((amount * matchRatio) - amount))
			}, 0)
		}
	})

	const leverageRemaining = remainingLeverage <= 0 ? 0 : roundFloat(String(remainingLeverage))

	const memberFunds = params.memberThemes.reduce((sum, member) => { return sum + (member.amount || 0) }, 0)

	const topOrgs = params.topOrgs.map(org => org._id)

	// Pledges with org information
	let pledges: PledgeWithOrg[] = []
	params.topOrgs.forEach(org => {
		org.pledges?.forEach((pledge: MatchPledge) => {
			if(org.title) {
				pledges.push({
					...pledge,
					org: {
						_id: org._id,
						title: org.title,
					},
				})
			}
		})
	})
	pledges = sortBy(pledges, ["createdAt"])

	const result: ThemeWithComputed = {
		...doc,
		pledgedTotal,
		votedFunds,
		fundsVotesCast,
		chitVotesCast,
		totalChitVotes,
		totalMembers,
		fundsVotingStarted,
		chitVotingStarted,
		leverageRemaining,
		memberFunds,
		consolationTotal,
		topOrgs,
		pledges,
	}

	return result
}

export default ThemeTransformer

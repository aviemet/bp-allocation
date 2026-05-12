import { sortBy } from "es-toolkit/compat"
import { roundFloat } from "/imports/lib/utils"
import { calculatePledgeMatches, leverageBonusForPledge, type PledgeMatchingResult } from "/imports/lib/pledgeMatching"

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
	allOrgs?: OrgWithComputed[]
	memberThemes: MemberTheme[]
	settings: SettingsData
	pledgeMatching?: PledgeMatchingResult
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
	pledgeMatchTotal: number
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

export const ThemeTransformer = (doc: ThemeData, params: ThemeTransformerParams): ThemeWithComputed => {
	const orgsForPledges = doc.allowRunnersUpPledges && params.allOrgs ? params.allOrgs : params.topOrgs

	const pledgedTotal = orgsForPledges.reduce((total, org) => {
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

	// Whether chit voting has begun - True if at least one person has cast a vote
	const chitVotingStarted = params.memberThemes.some(member => {
		return (member.chitVotes || []).some(vote => (vote.votes || 0) > 0)
	})

	// Whether funds voting has begun - True if at least one person has cast a vote
	const fundsVotingStarted = params.memberThemes.some(member => {
		return (member.allocations || []).some(vote => (vote.amount || 0) > 0)
	})

	// Amount given to orgs other than top orgs
	const consolationTotal = doc.consolationActive ? ((doc.organizations ? doc.organizations.length : 0) - (doc.numTopOrgs || 0)) * (doc.consolationAmount || 0) : 0

	const startingFundsTotal = doc.minStartingFundsActive
		? (doc.numTopOrgs || 0) * (doc.minStartingFunds || 0)
		: 0

	const orgsForLeverage = doc.allowRunnersUpPledges && params.allOrgs
		? params.allOrgs
		: params.topOrgs

	const topOrgIds = new Set(params.topOrgs.map(org => org._id))

	const pledgeMatching = params.pledgeMatching ?? calculatePledgeMatches(
		orgsForLeverage,
		doc,
		{ consolationTotal, startingFundsTotal, votedFunds, topOrgIds }
	)

	const leverageRemaining = roundFloat(String(pledgeMatching.remainingLeverage))

	// Total leverage consumed by all pledges (sum of bonuses applied from the pool).
	// Distinct from pledgedTotal, which is the raw sum of pledge amounts.
	const pledgeMatchTotal = orgsForLeverage.reduce((sum, org) => {
		if(!org.pledges) return sum
		return sum + org.pledges.reduce((orgSum, pledge) => {
			const matched = pledgeMatching.matchedAmounts.get(pledge._id) ?? 0
			return orgSum + leverageBonusForPledge(pledge, matched, doc)
		}, 0)
	}, 0)

	const memberFunds = params.memberThemes.reduce((sum, member) => { return sum + (member.amount || 0) }, 0)

	const topOrgs = params.topOrgs.map(org => org._id)

	// Pledges with org information
	let pledges: PledgeWithOrg[] = []
	orgsForPledges.forEach(org => {
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
		pledgeMatchTotal,
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

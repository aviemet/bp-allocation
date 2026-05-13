import { type ThemeData } from "/imports/api/db"
import { type MatchPledge } from "/imports/types/schema"

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

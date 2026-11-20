import { type MatchPledge } from "/imports/types/schema"

export const PLEDGE_DEDUPE_WINDOW_MS = 10_000

const recentPledgeAttempts = new Map<string, number>()

export const pledgeDedupeKey = (
	member: string,
	orgId: string,
	amount: number,
	pledgeType: string,
): string => `${member}:${orgId}:${amount}:${pledgeType}`

export const hasRecentMatchingPledge = (
	pledges: MatchPledge[] | undefined,
	member: string,
	amount: number,
	pledgeType: string,
	now: number = Date.now(),
	windowMs: number = PLEDGE_DEDUPE_WINDOW_MS,
): boolean => {
	return (pledges ?? []).some(pledge => (
		pledge.member === member
		&& pledge.amount === amount
		&& (pledge.pledgeType ?? "standard") === pledgeType
		&& pledge.createdAt instanceof Date
		&& now - pledge.createdAt.getTime() < windowMs
	))
}

export const tryClaimPledgeAttempt = (
	key: string,
	now: number = Date.now(),
	windowMs: number = PLEDGE_DEDUPE_WINDOW_MS,
): boolean => {
	const previous = recentPledgeAttempts.get(key)
	if(previous !== undefined && now - previous < windowMs) {
		return false
	}
	recentPledgeAttempts.set(key, now)
	return true
}

export const releasePledgeAttempt = (key: string, claimedAt: number): void => {
	if(recentPledgeAttempts.get(key) === claimedAt) {
		recentPledgeAttempts.delete(key)
	}
}

export const resetPledgeDedupeStateForTests = (): void => {
	recentPledgeAttempts.clear()
}

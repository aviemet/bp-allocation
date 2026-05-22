export interface MembersPublicationRefreshPlan {
	removed: string[]
	added: string[]
	changed: string[]
}

export function planMembersPublicationRefresh(
	publishedMemberIds: ReadonlySet<string>,
	memberIdsAfterRefresh: readonly string[],
): MembersPublicationRefreshPlan {
	const nextPublishedIds = new Set(memberIdsAfterRefresh)
	const removed: string[] = []
	const added: string[] = []
	const changed: string[] = []

	for(const publishedMemberId of publishedMemberIds) {
		if(!nextPublishedIds.has(publishedMemberId)) {
			removed.push(publishedMemberId)
		}
	}

	for(const memberId of memberIdsAfterRefresh) {
		if(publishedMemberIds.has(memberId)) {
			changed.push(memberId)
		} else {
			added.push(memberId)
		}
	}

	return { removed, added, changed }
}

export function applyMembersPublicationRefreshPlan(
	publishedMemberIds: Set<string>,
	plan: MembersPublicationRefreshPlan,
): void {
	for(const memberId of plan.removed) {
		publishedMemberIds.delete(memberId)
	}
	for(const memberId of plan.added) {
		publishedMemberIds.add(memberId)
	}
}

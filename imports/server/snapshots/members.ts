import { Mongo } from "meteor/mongo"

import { Members, MemberThemes, type MemberWithTheme } from "/imports/api/db"
import { MemberTransformer } from "/imports/server/transformers"
import { buildMemberThemeLookupMap } from "/imports/server/themeDataLoaders/memberThemeLookup"

export async function fetchMembersSnapshot(
	themeId: string,
	limit: number | false,
): Promise<MemberWithTheme[]> {
	const subOptions: { sort: Mongo.SortSpecifier, limit?: number } = { sort: { number: 1 } }
	if(limit !== false) {
		subOptions.limit = limit
	}

	const memberThemes = await MemberThemes.find({ theme: themeId }).fetchAsync()
	const memberIds = memberThemes
		.map(memberTheme => memberTheme.member)
		.filter((memberId): memberId is string => typeof memberId === "string")

	const membersParams = {
		memberThemeByMemberId: buildMemberThemeLookupMap(memberThemes, themeId),
	}

	const members = await Members.find({ _id: { $in: memberIds } }, subOptions).fetchAsync()

	return members.map(member =>
		MemberTransformer(member, membersParams.memberThemeByMemberId.get(member._id)),
	)
}

export async function fetchMemberSnapshot(
	memberId: string,
	themeId: string,
): Promise<MemberWithTheme | null> {
	const membersParams = {
		memberThemeByMemberId: buildMemberThemeLookupMap(
			await MemberThemes.find({ member: memberId, theme: themeId }).fetchAsync(),
			themeId,
		),
	}

	const member = await Members.findOneAsync({ _id: memberId })
	if(!member) {
		return null
	}

	return MemberTransformer(member, membersParams.memberThemeByMemberId.get(member._id))
}

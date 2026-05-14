import { Meteor } from "meteor/meteor"

import { type MemberWithTheme } from "/imports/api/db"
import { type OrgDataWithComputed } from "/imports/api/hooks/useOrgs"
import { type PledgeWithOrg } from "/imports/types/themeWithComputed"

export type OrgsListSnapshot = {
	orgs: OrgDataWithComputed[]
	topOrgs: OrgDataWithComputed[]
	pledges: PledgeWithOrg[]
}

export type MembersListSnapshot = MemberWithTheme[]

function isOrgsListSnapshot(value: unknown): value is OrgsListSnapshot {
	if(typeof value !== "object" || value === null) {
		return false
	}
	if(!("orgs" in value && "topOrgs" in value && "pledges" in value)) {
		return false
	}
	const candidate = value as { orgs: unknown, topOrgs: unknown, pledges: unknown }
	return Array.isArray(candidate.orgs) && Array.isArray(candidate.topOrgs) && Array.isArray(candidate.pledges)
}

function isMemberWithTheme(value: unknown): value is MemberWithTheme {
	if(typeof value !== "object" || value === null) {
		return false
	}
	const record = value as Record<string, unknown>
	return typeof record._id === "string" && typeof record.firstName === "string" && typeof record.lastName === "string" && typeof record.number === "number"
}

function isMembersListSnapshot(value: unknown): value is MembersListSnapshot {
	return Array.isArray(value) && value.every(isMemberWithTheme)
}

function isMemberWithThemeOrNull(value: unknown): value is MemberWithTheme | null {
	return value === null || isMemberWithTheme(value)
}

export async function callOrganizationsList(themeId: string): Promise<OrgsListSnapshot | null> {
	const result: unknown = await Meteor.callAsync("organizations.list", { themeId })
	if(!isOrgsListSnapshot(result)) {
		return null
	}
	return result
}

export async function callMembersList(themeId: string, limit: number | false): Promise<MembersListSnapshot> {
	const result: unknown = await Meteor.callAsync("members.list", { themeId, limit })
	if(!isMembersListSnapshot(result)) {
		return []
	}
	return result
}

export async function callMembersGet(memberId: string, themeId: string): Promise<MemberWithTheme | null> {
	const result: unknown = await Meteor.callAsync("members.get", { memberId, themeId })
	if(!isMemberWithThemeOrNull(result)) {
		return null
	}
	return result
}

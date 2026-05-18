import { faker } from "@faker-js/faker"

import { OrganizationMethods } from "/imports/api/methods"

export type OrgCreateInput = Parameters<typeof OrganizationMethods.create.callAsync>[0]

export const buildOrgCreateData = (
	themeId: string,
	overrides: Partial<OrgCreateInput> = {},
): OrgCreateInput => ({
	title: faker.company.name(),
	ask: faker.number.int({ min: 1000, max: 1_000_000 }),
	theme: themeId,
	...overrides,
})

export const insertTestOrg = async (
	themeId: string,
	overrides: Partial<OrgCreateInput> = {},
): Promise<string> => {
	const { response: orgId, error } = await OrganizationMethods.create.callAsync(
		buildOrgCreateData(themeId, overrides),
	)
	if(error || !orgId) {
		throw new Error("insertTestOrg: OrganizationMethods.create failed")
	}
	return orgId
}

import { Mongo } from "meteor/mongo"

export interface OrgPledgeFundingData {
	_id: string
	theme: string
	need: number
}

const orgPledgeFundingPermissions = {
	insert: () => false,
	update: () => false,
	remove: () => false,
}

export const OrgPledgeFunding = new Mongo.Collection<OrgPledgeFundingData>("orgPledgeFunding")

OrgPledgeFunding.allow(orgPledgeFundingPermissions)

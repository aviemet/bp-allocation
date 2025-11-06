import TrackableStore, { TrackableData } from "./lib/TrackableStore"
import { Organization } from "/imports/types/schema"

export type OrgData = TrackableData<Organization>

export interface OrganizationWithComputed extends Organization {
	votedTotal: number
	allocatedFunds: number
	need: number
	leverageFunds: number
	topOff: number
	amountFromVotes: number
	ask: number
}

interface OrgDataWithComputed extends OrgData {
	votedTotal?: number
	allocatedFunds?: number
	need?: number
	leverageFunds?: number
	topOff?: number
	amountFromVotes?: number
	ask?: number
}

class OrgStore extends TrackableStore<OrgData> {
	constructor(data: OrgDataWithComputed) {
		const initializedData: OrgData & OrganizationWithComputed = {
			...data,
			votedTotal: data.votedTotal ?? 0,
			allocatedFunds: data.allocatedFunds ?? 0,
			need: data.need ?? 0,
			leverageFunds: data.leverageFunds ?? 0,
			topOff: data.topOff ?? 0,
			amountFromVotes: data.amountFromVotes ?? 0,
			ask: data.ask ?? 0,
		}
		super(initializedData)
	}
}

interface OrgStore extends OrganizationWithComputed {}

export default OrgStore

import { isEmpty } from "lodash"
import React from "react"
import { useOrgs, useMembers } from "/imports/api/providers"
import ExportCsvButton from "/imports/ui/components/Buttons/ExportCsvButton"
import { Loading } from "/imports/ui/components"

interface PledgeData {
	Organization: string
	"Member Name": string
	"Member Number": number
	Amount: number
	"Pledged At": Date
}

const ExportTopups = () => {
	const { topOrgs, isLoading: orgsLoading } = useOrgs()
	const { members, isLoading: membersLoading } = useMembers()

	if(orgsLoading || membersLoading || isEmpty(members)) return <Loading />

	const pledges: PledgeData[] = []
	topOrgs.forEach(org => {
		org.pledges.forEach(pledge => {
			const member = members.values.find(member => member._id === pledge.member)
			if(member) {
				const pledgeData = {
					"Organization": org?.title,
					"Member Name": member?.fullName,
					"Member Number": member?.number,
					"Amount": pledge?.amount,
					"Pledged At": pledge?.createdAt,
				}
				pledges.push(pledgeData)
			}
		})
	})
	return (
		<ExportCsvButton
			data={ pledges }
			description="Topup Pledges"
		/>
	)
}

export default ExportTopups

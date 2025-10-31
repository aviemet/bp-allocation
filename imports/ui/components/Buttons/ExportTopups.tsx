import { isEmpty } from "lodash"
import { useOrgs, useMembers } from "/imports/api/providers"
import ExportCsvButton from "/imports/ui/components/Buttons/ExportCsvButton"
import { Loading } from "/imports/ui/components"

interface PledgeData {
	Organization: string
	"Member Name": string
	"Member Number": number
	Amount: number
	"Pledged At": Date
	[key: string]: string | number | Date
}

const ExportTopups = () => {
	const { topOrgs, isLoading: orgsLoading } = useOrgs()
	const { members, isLoading: membersLoading } = useMembers()

	if(orgsLoading || membersLoading || isEmpty(members)) return <Loading />

	const pledges: PledgeData[] = []
	topOrgs.forEach(org => {
		const orgTitle = org.title
		if(!orgTitle || !org.pledges) return

		org.pledges.forEach(pledge => {
			const member = members.values.find(member => member._id === pledge.member)
			if(member && pledge.amount && pledge.createdAt) {
				const pledgeData: PledgeData = {
					"Organization": orgTitle,
					"Member Name": member.fullName || "",
					"Member Number": member.number,
					"Amount": pledge.amount,
					"Pledged At": pledge.createdAt,
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

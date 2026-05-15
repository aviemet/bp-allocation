import { useOrgs, useMembers } from "/imports/api/hooks"
import { ExportCsvButton } from "/imports/ui/components/Buttons/ExportCsvButton"

interface PledgeData {
	Organization: string
	"Member Name": string
	"Member Number": number
	Amount: number
	"Pledged At": Date
	[key: string]: string | number | Date
}

export const ExportPledges = () => {
	const { topOrgs, orgsLoading } = useOrgs()
	const { members, membersLoading } = useMembers()

	const exportDisabled = orgsLoading || membersLoading

	const pledges: PledgeData[] = []
	topOrgs.forEach(org => {
		const orgTitle = org.title
		if(!orgTitle || !org.pledges) return

		org.pledges.forEach(pledge => {
			const member = members.find(member => member._id === pledge.member)
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
			disabled={ exportDisabled }
			data={ pledges }
			description="Pledges"
		/>
	)
}


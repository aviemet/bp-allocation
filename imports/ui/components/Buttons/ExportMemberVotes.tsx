import { format } from "date-fns"
import { isEmpty } from "lodash"
import { useOrgs, useMembers } from "/imports/api/hooks"
import { type MemberTheme } from "/imports/types/schema"
import { Loading } from "/imports/ui/components"
import ExportCsvButton from "/imports/ui/components/Buttons/ExportCsvButton"
import { type MemberStore } from "/imports/api/stores"

interface MemberVoteData {
	Name: string
	Code?: string
	Initials?: string
	Number: number
	[key: string]: string | number | undefined
}

interface MemberStoreWithTheme extends MemberStore {
	theme?: MemberTheme
}

const ExportMemberVotes = () => {
	const { topOrgs, orgsLoading } = useOrgs()
	const { members, membersLoading } = useMembers()

	if(orgsLoading || membersLoading || isEmpty(members)) return <Loading />
	return (
		<ExportCsvButton
			data={ members.map(member => {
				const memberWithTheme = member as MemberStoreWithTheme
				const memberTheme = memberWithTheme.theme

				let newMember: MemberVoteData = {
					Name: member.fullName || "",
					Code: member.code,
					Initials: member.initials,
					Number: member.number,
				}

				topOrgs.forEach(org => {
					const orgTitle = org.title
					if(!orgTitle) return

					const allocation = memberTheme?.allocations?.find(allocation => allocation.organization === org._id)
					newMember[orgTitle] = allocation?.amount || 0
					newMember["Source"] = allocation?.voteSource || ""
					newMember["Voted At"] = allocation?.createdAt ? format(allocation.createdAt, "hh:mma MM/dd/yy") : ""
				})

				return newMember
			}) }
			description="Member Votes"
		/>
	)
}

export default ExportMemberVotes

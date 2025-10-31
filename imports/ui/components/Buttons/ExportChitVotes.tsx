import { format } from "date-fns"
import { isEmpty } from "lodash"
import { useOrgs, useMembers } from "/imports/api/providers"
import { type MemberTheme } from "/imports/types/schema"
import { Loading } from "/imports/ui/components"
import ExportCsvButton from "/imports/ui/components/Buttons/ExportCsvButton"
import { type MemberStore } from "/imports/api/stores"

interface ChitVoteData {
	Name: string
	Code?: string
	Initials?: string
	Number: number
	[key: string]: string | number | undefined
}

interface MemberStoreWithTheme extends MemberStore {
	theme?: MemberTheme
}

const ExportChitVotes = () => {
	const { orgs, isLoading: orgsLoading } = useOrgs()
	const { members, isLoading: membersLoading } = useMembers()

	if(orgsLoading || membersLoading || isEmpty(members) || !orgs) return <Loading />
	return (
		<ExportCsvButton
			data={ members.values.map(member => {
				const memberWithTheme = member as MemberStoreWithTheme
				const memberTheme = memberWithTheme.theme

				let newMember: ChitVoteData = {
					Name: member.fullName || "",
					Code: member.code,
					Initials: member.initials,
					Number: member.number,
				}

				orgs.values.forEach(org => {
					const orgTitle = org.title
					if(!orgTitle) return

					const chits = memberTheme?.chitVotes?.find((vote) => vote.organization === org._id)
					newMember[orgTitle] = chits?.votes || 0
					newMember["Source"] = chits?.voteSource || ""
					newMember["Voted At"] = chits?.createdAt ? format(chits.createdAt, "hh:mma MM/dd/yy") : ""
				})

				return newMember
			}) }
			description="Chit Votes"
		/>
	)
}

export default ExportChitVotes

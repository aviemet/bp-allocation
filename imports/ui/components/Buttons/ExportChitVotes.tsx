import { format } from "date-fns"
import { useOrgs, useMembers } from "/imports/api/hooks"
import { ExportCsvButton } from "/imports/ui/components/Buttons"
import { type MemberWithTheme } from "/imports/api/db"

interface ChitVoteData {
	Name: string
	Code?: string
	Initials?: string
	Number: number
	[key: string]: string | number | undefined
}

export const ExportChitVotes = () => {
	const { orgs, orgsLoading } = useOrgs()
	const { members, membersLoading } = useMembers()

	const exportDisabled = orgsLoading || membersLoading

	return (
		<ExportCsvButton
			disabled={ exportDisabled }
			data={ members.map(member => {
				const memberWithTheme = member as MemberWithTheme
				const memberTheme = memberWithTheme.theme

				let newMember: ChitVoteData = {
					Name: member.fullName || "",
					Code: member.code,
					Initials: member.initials,
					Number: member.number,
				}

				orgs.forEach(org => {
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


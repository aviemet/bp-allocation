import { format } from "date-fns"
import { isEmpty } from "lodash"
import React from "react"
import { useOrgs, useMembers } from "/imports/api/providers"
import { Loading } from "/imports/ui/Components"
import ExportCsvButton from "/imports/ui/Components/Buttons/ExportCsvButton"

interface MemberVoteData {
	Name: string
	Code?: string
	Initials?: string
	Number: number
	[key: string]: string | number | undefined
}

const ExportMemberVotes = () => {
	const { topOrgs, isLoading: orgsLoading } = useOrgs()
	const { members, isLoading: membersLoading } = useMembers()

	if(orgsLoading || membersLoading || isEmpty(members)) return <Loading />
	return (
		<ExportCsvButton
			data={ members.values.map(member => {
				let newMember: MemberVoteData = {
					Name: member.fullName,
					Code: member.code,
					Initials: member.initials,
					Number: member.number,
				}

				topOrgs.forEach(org => {
					const allocation = member.theme.allocations.find(allocation => allocation.organization === org._id)
					newMember[org.title] = allocation ? allocation.amount : 0
					newMember["Source"] = allocation ? allocation.voteSource : ""
					newMember["Voted At"] = allocation ? format(allocation.createdAt, "hh:mma MM/dd/yy") : ""
				})

				return newMember
			}) }
			description="Member Votes"
		/>
	)
}

export default ExportMemberVotes

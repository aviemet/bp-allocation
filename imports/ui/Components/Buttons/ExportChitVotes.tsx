import React from "react"
import { useOrgs, useMembers } from "/imports/api/providers"
import { Loading } from "/imports/ui/Components"
import ExportCsvButton from "/imports/ui/Components/Buttons/ExportCsvButton"
import { isEmpty } from "lodash"
import { format } from "date-fns"

const ExportChitVotes = () => {
	const { orgs, isLoading: orgsLoading } = useOrgs()
	const { members, isLoading: membersLoading } = useMembers()

	if(orgsLoading || membersLoading || isEmpty(members)) return <Loading />
	return (
		<ExportCsvButton
			data={ members.values.map(member => {
				let newMember = {
					"Name": member.fullName,
					"Code": member.code,
					"Initials": member.initials,
					"Number": member.number,
				}

				orgs.values.forEach(org => {
					const chits = member.theme.chitVotes.find(vote => vote.organization === org._id)
					newMember[org.title] = chits ? chits.votes : 0
					newMember["Source"] = chits ? chits.voteSource : ""
					newMember["Voted At"] = chits ? format(chits.createdAt, "hh:mma MM/dd/yy") : ""
				})

				return newMember
			}) }
			description="Chit Votes"
		/>
	)
}

export default ExportChitVotes

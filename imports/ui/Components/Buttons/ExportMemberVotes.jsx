import React from 'react'
import { useOrgs, useMembers } from '/imports/api/providers'
import { Loading } from '/imports/ui/Components'
import ExportCsvButton from '/imports/ui/Components/Buttons/ExportCsvButton'
import { isEmpty } from 'lodash'

const ExportMemberVotes = () => {
	const { topOrgs, isLoading: orgsLoading } = useOrgs()
	const { members, isLoading: membersLoading } = useMembers()

	if(orgsLoading || membersLoading || isEmpty(members)) return <Loading />
	return (
		<ExportCsvButton
			data={ members.values.map(member => {
				let newMember = {
					'Name': member.fullName,
					'Code': member.code,
					'Initials': member.initials,
					'Number': member.number
				}

				topOrgs.forEach(org => {
					const allocation = member.theme.allocations.find(allocation => allocation.organization === org._id)
					newMember[org.title] = allocation ? allocation.amount : 0
					newMember['Source'] = allocation ? allocation.voteSource : ''
				})

				return newMember

			}) }
			description='Member Votes'
		/>
	)
}

export default ExportMemberVotes
import { useMemo } from "react"
import MemberSearch from "/imports/ui/components/MemberSearch"
import { useFormContext, useWatch } from "react-hook-form"
import { useMembers } from "/imports/api/providers"
import { type MemberData } from "/imports/api/db"

const MemberSearchInput = () => {
	const { setValue } = useFormContext()
	const { member } = useWatch<{ member: string }>()
	const { members, isLoading: membersLoading } = useMembers()

	const selectedMember = useMemo<MemberData | null>(() => {
		if(membersLoading || !member) return null

		const foundMember = members?.values.find(mem => mem._id === member)
		return foundMember ?? null
	}, [member, members, membersLoading])

	const handleSetValue = (value: MemberData | null) => {
		setValue("member", value ? value._id : "")
	}

	return (
		<MemberSearch
			value={ selectedMember }
			setValue={ handleSetValue }
		/>
	)
}

export default MemberSearchInput

// onResultSelect={ handleResultSelect }

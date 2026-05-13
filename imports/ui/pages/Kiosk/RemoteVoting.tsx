import { ComponentType } from "react"
import { useMember } from "/imports/api/hooks"
import { type MemberWithTheme } from "/imports/api/db"
import { VotingSource } from "/imports/api/methods/MemberMethods"

import { KioskVotingProvider } from "./KioskVotingContext"
import { Loading } from "/imports/ui/components"

interface RemoteVotingProps {
	memberId: string
	component: ComponentType<{ user: MemberWithTheme, source: VotingSource }> | ComponentType<{ user: MemberWithTheme }>
	unsetUser?: () => void
}

export const RemoteVoting = ({
	memberId,
	component,
	unsetUser = () => {},
}: RemoteVotingProps) => {
	const { member, memberLoading } = useMember(memberId)

	if(memberLoading) return <Loading />

	if(!member) return (
		<h1>Member Not Found</h1>
	)

	const Component = component
	return (
		<KioskVotingProvider member={ member } unsetUser={ unsetUser }>
			<Component user={ member } source="mobile" />
		</KioskVotingProvider>
	)
}


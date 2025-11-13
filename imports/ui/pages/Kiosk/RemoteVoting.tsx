import { isEmpty } from "lodash"
import { ComponentType } from "react"
import { useMembers } from "/imports/api/hooks"
import { type MemberWithTheme } from "/imports/server/transformers/memberTransformer"
import { VotingSource } from "/imports/api/methods/MemberMethods"

import { FundsVoteProvider } from "./VotingContext"

import { Loading } from "/imports/ui/components"

interface RemoteVotingProps {
	memberId: string
	component: ComponentType<{ user: MemberWithTheme, source: VotingSource }> | ComponentType<{ user: MemberWithTheme }>
	unsetUser?: () => void
}

const RemoteVoting = ({
	memberId,
	component,
	unsetUser = () => {},
}: RemoteVotingProps) => {
	const { members, membersLoading } = useMembers()

	if(membersLoading || isEmpty(members)) return <Loading />

	// TODO: This should be a subscription to a single member
	const member = members.find(member => member._id === memberId)
	// console.log({ member })

	// if(membersLoading) return <Loader active />
	if(!member) return (
		<h1>Member Not Found</h1>
	)

	const Component = component
	return (
		<FundsVoteProvider member={ member } unsetUser={ unsetUser }>
			<Component user={ member } source="mobile" />
		</FundsVoteProvider>
	)
}

export default RemoteVoting

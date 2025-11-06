import { isEmpty } from "lodash"
import { observer } from "mobx-react-lite"
import { ComponentType } from "react"
import { useMembers } from "/imports/api/providers"

import { VotingContextProvider } from "./VotingContext"

import { Loading } from "/imports/ui/components"

interface RemoteVotingProps {
	memberId: string
	component: ComponentType<{ user: unknown, source: string }>
	unsetUser: () => void
}

const RemoteVoting = observer(({ memberId, component, unsetUser }: RemoteVotingProps) => {
	const { members, isLoading: membersLoading } = useMembers()

	if(membersLoading || isEmpty(members)) return <Loading />

	// TODO: This should be a subscription to a single member
	const member = members.values.find(member => member._id === memberId)
	// console.log({ member })

	// if(membersLoading) return <Loader active />
	if(!member) return (
		<h1>Member Not Found</h1>
	)

	const Component = component
	return (
		<VotingContextProvider member={ member } unsetUser={ unsetUser }>
			<Component user={ member } source="mobile" />
		</VotingContextProvider>
	)
})

export default RemoteVoting

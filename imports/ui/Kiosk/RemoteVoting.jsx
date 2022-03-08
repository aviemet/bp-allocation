import React from 'react'
import PropTypes from 'prop-types'

import { isEmpty } from 'lodash'
import { observer } from 'mobx-react-lite'
import { useMembers } from '/imports/api/providers'

import { VotingContextProvider } from './VotingContext'

import {
	CircularProgress
} from '@mui/material'
// import { Loader } from 'semantic-ui-react'

const RemoteVoting = observer(({ memberId, component }) => {
	const { members, isLoading: membersLoading } = useMembers()

	if(membersLoading || isEmpty(members)) return <CircularProgress />

	// TODO: This should be a subscription to a single member
	const member = members.values.find(member => member._id === memberId)
	console.log({ member })

	// if(membersLoading) return <Loader active />
	if(!member) return (
		<h1>Member Not Found</h1>
	)

	const Component = component
	return (
		<VotingContextProvider member={ member || false }>
			<Component user={ member || false } source='mobile' />
		</VotingContextProvider>
	)
})

RemoteVoting.propTypes = {
	memberId: PropTypes.string.isRequired,
	component: PropTypes.any.isRequired
}

export default RemoteVoting
